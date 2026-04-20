import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../errors/index.js";
import { ListAssetsService } from "../../services/asset/list-assets-service.js";

export class ListAssetsController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    try {
      const listAssetsService = new ListAssetsService()
      const assets = await listAssetsService.execute()

      return rep.status(200).send({ message: "Success on find all assets", assets })
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return rep.status(404).send({ error: error.message })
      }

      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}