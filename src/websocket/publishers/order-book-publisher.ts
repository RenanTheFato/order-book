import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../../config/prisma.js";
import { connectionManager } from "../connection-manager.js";

export async function publishOrderBookUpdate(asset_id: string, affectedPrices: { price: Decimal; side: "BUY" | "SELL" }[]): Promise<void> {
  const channel = `order-book:${asset_id}`
  if (!connectionManager.hasSubscribers(channel)) {
    return
  }

  const bidsUpdates: { price: string; quantity: string }[] = []
  const asksUpdates: { price: string; quantity: string }[] = []

  for (const { price, side } of affectedPrices) {
    const priceKey = price.toFixed(8)

    const aggregate = await prisma.orders.aggregate({
      where: {
        asset_id,
        side,
        price,
        status: { in: ["OPEN", "PARTIALLY_FILLED"] },
        type: "LIMIT",
      },
      _sum: {
        quantity: true,
        quantity_filled: true,
      },
    })

    const totalQty = aggregate._sum.quantity ?? new Decimal(0)
    const totalFilled = aggregate._sum.quantity_filled ?? new Decimal(0)
    const remaining = totalQty.sub(totalFilled)

    const entry = {
      price: priceKey,
      quantity: remaining.lte(0) ? "0.00000000" : remaining.toFixed(8),
    }

    if (side === "BUY") {
      bidsUpdates.push(entry)
    }
    else {
      asksUpdates.push(entry)
    }
  }

  connectionManager.broadcast(channel, {
    event: "order-book:update",
    asset_id,
    data: { bids: bidsUpdates, asks: asksUpdates },
  })
}