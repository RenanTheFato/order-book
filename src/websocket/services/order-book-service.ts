import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../../config/prisma.js";

export interface PriceLevel {
  price: string,
  quantity: string,
}

export interface OrderBookSnapshot {
  bids: PriceLevel[],
  asks: PriceLevel[],
}

export async function getOrderBookSnapshot(asset_id: string): Promise<OrderBookSnapshot> {
  const orders = await prisma.orders.findMany({
    where: {
      asset_id,
      status: { in: ["OPEN", "PARTIALLY_FILLED"] },
      type: "LIMIT",
    },
    select: {
      side: true,
      price: true,
      quantity: true,
      quantity_filled: true,
    },
  })

  const bidsMap = new Map<string, Decimal>()
  const asksMap = new Map<string, Decimal>()

  for (const order of orders) {
    if (!order.price) {
      continue
    }

    const remaining = order.quantity.sub(order.quantity_filled)
    if (remaining.lte(0)) {
      continue
    }

    const priceKey = order.price.toFixed(8)
    const map = order.side === "BUY" ? bidsMap : asksMap
    const current = map.get(priceKey) ?? new Decimal(0)
    map.set(priceKey, current.add(remaining))
  }

  const bids = [...bidsMap.entries()]
    .sort((a, b) => new Decimal(b[0]).comparedTo(new Decimal(a[0])))
    .map(([price, quantity]) => ({ price, quantity: quantity.toFixed(8) }))

  const asks = [...asksMap.entries()]
    .sort((a, b) => new Decimal(a[0]).comparedTo(new Decimal(b[0])))
    .map(([price, quantity]) => ({ price, quantity: quantity.toFixed(8) }))

  return { bids, asks }
}