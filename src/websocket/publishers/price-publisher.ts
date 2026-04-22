import { Decimal } from "@prisma/client/runtime/client";
import { connectionManager } from "../connection-manager.js";

export function publishPriceUpdate(asset_id: string, price: Decimal): void {
  const channel = `price:${asset_id}`
  if (!connectionManager.hasSubscribers(channel)) {
    return
  }

  connectionManager.broadcast(channel, {
    event: "price:update",
    asset_id,
    data: {
      price: price.toFixed(8),
      at: new Date(),
    },
  })
}