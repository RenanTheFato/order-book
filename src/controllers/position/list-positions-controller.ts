import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../interfaces/user.js";
import { NotFoundError } from "../../errors/index.js";
import { ListPositionsService } from "../../services/position/list-positions-service.js";

export class ListPositionsController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    try {
      const listPositionsService = new ListPositionsService()
      const positions = await listPositionsService.execute({ id })

      return rep.status(200).send({ message: "Positions fetched successfully", positions })
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return rep.status(404).send({ error: error.message })
      }

      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}