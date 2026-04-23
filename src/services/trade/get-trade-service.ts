import { prisma } from "../../config/prisma.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { Trade } from "../../interfaces/trade.js";

interface GetTradeParams {
  id: string,
  asset_id?: string,
  limit?: number,
}

export class GetTradeService {
  async execute({ id, asset_id, limit = 50 }: GetTradeParams): Promise<Trade[]> {
    const user = await prisma.users.findUnique({
      where: {
        id
      },
      select: {
        id: true
      },
    })

    if (!user) {
      throw new NotFoundError("User not found")
    }

    if (asset_id) {
      const asset = await prisma.assets.findUnique({
        where: {
          id: asset_id
        },
        select: {
          id: true
        },
      })

      if (!asset) {
        throw new NotFoundError("Asset not found")
      }
    }

    if (limit < 1 || limit > 200) {
      throw new BadRequestError("limit must be a number between 1 and 200")
    }

    const trades = prisma.trades.findMany({
      where: {
        ...(asset_id ? { asset_id } : {}),
        OR: [
          {
            maker_order: {
              user_id: id
            }
          },
          {
            taker_order: {
              user_id: id
            }
          },
        ],
      },
      orderBy: {
        executed_at: "desc"
      },
      take: limit,
    })

    return trades
  }
}