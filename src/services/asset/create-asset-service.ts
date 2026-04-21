import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../../config/prisma.js";
import { BadRequestError } from "../../errors/index.js";
import { Asset } from "../../interfaces/asset.js";
import { User } from "../../interfaces/user.js";

interface CreateAssetInput extends Pick<Asset, 'name' | 'ticker' | 'total_supply' | 'last_price'> {
  id: User['id'];
}

export class CreateAssetService {
  async execute({ id, name, ticker, total_supply, last_price }: CreateAssetInput): Promise<Asset> {
    const asset = await prisma.assets.findUnique({
      where: {
        ticker
      }
    })

    if (asset) {
      throw new BadRequestError("This ticker is already in use")
    }

    const emissionCost = total_supply.mul(last_price)

    const createdAsset = await prisma.$transaction(async (tx) => {
      const user = await tx.users.findUnique({
        where: {
          id
        },
        select: {
          balance: true
        }
      })

      if (!user) {
        throw new BadRequestError("User not found")
      }

      if (user.balance.lt(emissionCost)) {
        throw new BadRequestError(`Insufficient balance to emit this asset. Required: ${emissionCost.toFixed(2)}, Available: ${user.balance.toFixed(2)}`)
      }

      await tx.users.update({
        where: {
          id
        },
        data: {
          balance: { decrement: emissionCost }
        }
      })

      const asset = await tx.assets.create({
        data: {
          name,
          ticker,
          total_supply,
          last_price,
          last_price_at: new Date()
        }
      })

      await tx.userPositions.create({
        data: {
          user_id: id,
          asset_id: asset.id,
          quantity: total_supply,
          quantity_locked: new Decimal(0),
          avg_price: last_price
        }
      })

      return asset
    })

    return createdAsset
  }
}