import { prisma } from "../../config/prisma.js"
import { BadRequestError, NotFoundError } from "../../errors/index.js"
import { Trade } from "../../interfaces/trade.js"

interface ListByAssetParams {
  asset_id: string
  limit?: number
}

export class ListTradesService {
  async listByAsset({ asset_id, limit = 50 }: ListByAssetParams): Promise<Trade[]> {
    const asset = await prisma.assets.findUnique({ where: { id: asset_id } })

    if (!asset) {
      throw new NotFoundError("Asset not found")
    }

    if (limit < 1 || limit > 200) {
      throw new BadRequestError("limit must be a number between 1 and 200")
    }

    const trades =  prisma.trades.findMany({
      where: { 
        asset_id 
      },
      orderBy: { 
        executed_at: "desc" 
      },
      take: limit,
    })

    return trades
  }
}