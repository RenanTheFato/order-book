import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../interfaces/user.js";
import { Order } from "../../interfaces/order.js";
import { GetOrderService } from "../../services/order/get-order-service.js";
import { InvalidOperationError, NotFoundError } from "../../errors/index.js";

export class GetOderController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, 'id'>
    const { order_id } = req.params as { order_id: Order['id'] }

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    if (!order_id) {
      return rep.status(400).send({ error: "The order id is missing" })
    }

    try {
      const getOrderService = new GetOrderService()
      const order = await getOrderService.execute({ id, order_id })

      return rep.status(200).send({ message: "Order fetched successfully", order })
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return rep.status(404).send({ error: error.message })
      }
      if (error instanceof InvalidOperationError) {
        return rep.status(403).send({ error: error.message })
      }
      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}