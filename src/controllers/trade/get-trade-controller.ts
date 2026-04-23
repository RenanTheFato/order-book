import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodError } from "zod/v4";
import { User } from "../../interfaces/user.js";
import { GetTradeService } from "../../services/trade/get-trade-service.js";
import { NotFoundError, BadRequestError } from "../../errors/index.js";

export class GetTradeController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, "id">

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    const querySchema = z.object({
      limit: z.string()
        .optional()
        .transform((val) => (val ? Number(val) : 50))
        .refine((val) => !isNaN(val) && val > 0 && val <= 200, { error: "limit must be a number between 1 and 200", }),
      asset_id: z.uuid({ error: "asset_id must be a valid UUID" }).optional(),
    })

    let limit = 50
    let asset_id: string | undefined

    try {
      const query = querySchema.parse(req.query)
      limit = query.limit
      asset_id = query.asset_id
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
      const service = new GetTradeService();
      const trades = await service.execute({ id, asset_id, limit })

      return rep.status(200).send({ trades })
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