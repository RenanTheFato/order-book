import { prisma } from "../../config/prisma.js";
import { BadRequestError } from "../../errors/index.js";
import { Asset } from "../../interfaces/asset.js";

export class CreateAssetService {
  async execute({ name, ticker, total_supply, last_price }: Pick<Asset, 'name' | 'ticker' | 'total_supply' | 'last_price'>): Promise<Asset> {
    const asset = await prisma.assets.findUnique({
      where: {
        ticker
      }
    })

    if (asset) {
      throw new BadRequestError("This ticker is already in use")
    }

    const createdAsset = await prisma.assets.create({
      data: {
        name,
        ticker,
        total_supply,
        last_price,
        last_price_at: new Date
      }
    })

    return createdAsset
  }
}