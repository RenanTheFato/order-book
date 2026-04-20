import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../errors/index.js";
import { Asset } from "../../interfaces/asset.js";
import { GetAssetService } from "../../services/asset/get-asset-service.js";

export class GetAssetController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { ticker } = req.params as Pick<Asset, 'ticker'>

    if (!ticker) {
      return rep.status(400).send({ error: "The ticker is missing" })
    }

    try {
      const getAssetService = new GetAssetService()
      const data = await getAssetService.execute({ ticker })

      return rep.status(200).send({ message: "Asset fetched ", data })
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return rep.status(404).send({ error: error.message })
      }

      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}