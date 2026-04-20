import { prisma } from "../../config/prisma.js"
import { NotFoundError } from "../../errors/index.js"
import { Asset } from "../../interfaces/asset.js"

export class GetAssetService {
  async execute({ ticker }: Pick<Asset, 'ticker'>): Promise<Asset> {
    const asset = await prisma.assets.findUnique({
      where: {
        ticker,
      }
    })

    if (!asset) {
      throw new NotFoundError("Asset not found")
    }

    return asset

  }
}