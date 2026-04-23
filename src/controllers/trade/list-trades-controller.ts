import { FastifyReply, FastifyRequest } from "fastify"
import { z, ZodError } from "zod/v4"
import { NotFoundError, BadRequestError } from "../../errors/index.js"
import { ListTradesService } from "../../services/trade/list-trades-service.js"
import { User } from "../../interfaces/user.js"

export class ListAssetTradesController {
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

    const querySchema = z.object({
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 50))
        .refine((val) => !isNaN(val) && val > 0 && val <= 200, {
          error: "limit must be a number between 1 and 200",
        }),
    })

    let limit = 50

    try {
      const query = querySchema.parse(req.query)
      limit = query.limit
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          message: err.message,
          path: err.path.join("/"),
        }))
        return rep.status(400).send({ error: "Validation Error", errors })
      }
    }

    try {
      const service = new ListTradesService()
      const trades = await service.listByAsset({ asset_id, limit })

      return rep.status(200).send({ trades })
    } catch (error) {
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