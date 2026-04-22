import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../interfaces/user.js";
import { InvalidOperationError, NotFoundError } from "../../errors/index.js";
import { ListOrdersService } from "../../services/order/list-orders-service.js";

export class ListOrdersController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    try {
      const listOrdersService = new ListOrdersService()
      const orders = await listOrdersService.execute({ id })

      return rep.status(200).send({ message: "Orders fetched successfully", orders })
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return rep.status(404).send({ error: error.message })
      }

      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}