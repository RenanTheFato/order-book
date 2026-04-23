import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { Auth } from "../middlewares/auth-middleware.js";
import { CreateAssetController } from "../controllers/asset/create-asset-controller.js";
import { GetAssetController } from "../controllers/asset/get-asset-controller.js";
import { ListAssetsController } from "../controllers/asset/list-assets-controller.js";
import { GetOrderBookController } from "../controllers/asset/get-orderbook-controller.js";

export async function assetRoutes(fastify: FastifyTypedInstance) {
  fastify.post("/create", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateAssetController().handle(req, rep)
  })

  fastify.get("/view/:ticker", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new GetAssetController().handle(req, rep)
  })

  fastify.get("/list", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ListAssetsController().handle(req, rep)
  })

  fastify.get("/order-book/:asset_id", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new GetOrderBookController().handle(req, rep)
  })
}