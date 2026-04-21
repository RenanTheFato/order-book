import { Decimal } from "@prisma/client/runtime/client";
import { connectionManager } from "../connection-manager.js";

interface TradePayLoad {
  id: string,
  asset_id: string,
  price: Decimal,
  quantity: Decimal,
  executed_at: Date
}

export function publishTrade(trade: TradePayLoad) : void {
  const channel = `trades:${trade.asset_id}`
  if (!connectionManager.hasSubscribers(channel)) {
    return
  }

  connectionManager.broadcast(channel, {
    event: "trades:new",
    asset_id: trade.asset_id,
    data: {
      id: trade.id,
      price: trade.price.toFixed(8),
      quantity: trade.quantity.toFixed(8),
      executed_at: trade.executed_at
    }
  })
}