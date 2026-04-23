import { FastifyReply, FastifyRequest } from "fastify"
import { z, ZodError } from "zod/v4"
import { NotFoundError } from "../../errors/index.js"
import { GetOrderBookService } from "../../services/asset/get-orderbook-service.js"
import { User } from "../../interfaces/user.js"

export class GetOrderBookController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    const paramsSchema = z.object({
      asset_id: z.uuid({ error: "asset_id must be a valid UUID" }),
    })

    try {
      paramsSchema.parse(req.params)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          message: err.message,
          path: err.path.join("/"),
        }))
        return rep.status(400).send({ error: "Validation Error", errors })
      }
    }

    const { asset_id } = req.params as z.infer<typeof paramsSchema>

    try {
      const service = new GetOrderBookService()
      const orderBook = await service.execute(asset_id)

      return rep.status(200).send({ orderBook })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return rep.status(404).send({ error: error.message })
      }

      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}