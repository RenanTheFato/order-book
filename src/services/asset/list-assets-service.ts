import { Assets } from "@prisma/client"
import { prisma } from "../../config/prisma.js"
import { NotFoundError } from "../../errors/index.js"

export class ListAssetsService {
  async execute(): Promise<Assets[]> {
    const assets = await prisma.assets.findMany()

    if (assets.length === 0) {
      throw new NotFoundError("No assets found")
    }

    return assets

  }
}