import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodError } from "zod/v4";
import { User } from "../../interfaces/user.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { CancelOrderService } from "../../services/order/cancel-order-service.js";

export class CancelOrderController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, "id">

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    const paramsSchema = z.object({
      order_id: z.uuid({ error: "The order_id must be a valid UUID" })
    })

    try {
      paramsSchema.parse(req.params)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          message: err.message,
          code: err.code,
          path: err.path.join("/"),
        }))

        return rep.status(400).send({ error: "Validation Error Occurred", errors })
      }
    }

    const { order_id } = req.params as z.infer<typeof paramsSchema>

    try {
      const cancelOrderService = new CancelOrderService()
      const order = await cancelOrderService.execute({ id, order_id })

      return rep.status(200).send({ message: "Order cancelled successfully", order })
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return rep.status(404).send({ error: error.message })
      }

      if (error instanceof BadRequestError) {
        return rep.status(400).send({ error: error.message })
      }

      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}