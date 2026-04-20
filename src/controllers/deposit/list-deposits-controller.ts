import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../interfaces/user.js";
import { NotFoundError, InvalidOperationError } from "../../errors/index.js";
import { ListDepositsService } from "../../services/deposit/list-deposits-service.js";

export class ListDepositsController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    try {
      const listDepositsService = new ListDepositsService()
      const deposits = await listDepositsService.execute({ id })

      return rep.status(200).send({ message: "Success on find all deposits", deposits })
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return rep.status(404).send({ error: error.message })
      }
      
      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}