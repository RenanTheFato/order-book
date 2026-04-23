import { FastifyReply, FastifyRequest } from "fastify"
import { FastifyTypedInstance } from "../@types/fastify-types.js"
import { Auth } from "../middlewares/auth-middleware.js"
import { GetTradeController } from "../controllers/trade/get-trade-controller.js"
import { ListAssetTradesController } from "../controllers/trade/list-trades-controller.js"

export async function tradeRoutes(fastify: FastifyTypedInstance) {
  fastify.get("/list", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new GetTradeController().handle(req, rep)
  })

  fastify.get("/asset/:asset_id", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ListAssetTradesController().handle(req, rep)
  })
}