import { Decimal } from "@prisma/client/runtime/client";
import { connectionManager } from "../connection-manager.js";

export function publishOrderUpdate(user_id: string, order: { id: string, status: string, quantity_filled: Decimal }): void {
  const channel = `orders:${user_id}`
  if (!connectionManager.hasSubscribers(channel)) return

  connectionManager.broadcast(channel, {
    event: "orders:update",
    data: {
      id: order.id,
      status: order.status,
      quantity_filled: order.quantity_filled.toFixed(8),
    },
  })
}

export function publishPositionUpdate(user_id: string, position: { asset_id: string, quantity: Decimal, avg_price: Decimal }): void {
  const channel = `positions:${user_id}`
  console.log(`[publishOrderUpdate] channel: ${channel}, hasSubscribers: ${connectionManager.hasSubscribers(channel)}`)
  if (!connectionManager.hasSubscribers(channel)) return

  connectionManager.broadcast(channel, {
    event: "positions:update",
    data: {
      asset_id: position.asset_id,
      quantity: position.quantity.toFixed(8),
      avg_price: position.avg_price.toFixed(8),
    },
  })
}

export function publishBalanceUpdate(user_id: string, balance: Decimal): void {
  const channel = `balance:${user_id}`
  console.log(`[publishBalanceUpdate] channel: ${channel}, hasSubscribers: ${connectionManager.hasSubscribers(channel)}`)
  if (!connectionManager.hasSubscribers(channel)) return

  connectionManager.broadcast(channel, {
    event: "balance:update",
    data: {
      balance: balance.toFixed(2),
    },
  })
}