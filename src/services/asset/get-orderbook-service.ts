import { prisma } from "../../config/prisma.js"
import { NotFoundError } from "../../errors/index.js"
import { getOrderBookSnapshot, OrderBookSnapshot } from "../../websocket/services/order-book-service.js"

interface GetOrderBookResult extends OrderBookSnapshot {
  asset_id: string
  last_price: string
  last_price_at: Date | null
}

export class GetOrderBookService {
  async execute(asset_id: string): Promise<GetOrderBookResult> {
    const asset = await prisma.assets.findUnique({
      where: {
        id: asset_id
      },
      select: {
        id: true,
        last_price: true,
        last_price_at: true
      },
    })

    if (!asset) {
      throw new NotFoundError("Asset not found")
    }

    const snapshot = await getOrderBookSnapshot(asset_id)

    return {
      asset_id,
      last_price: asset.last_price.toFixed(8),
      last_price_at: asset.last_price_at,
      ...snapshot,
    }
  }
}