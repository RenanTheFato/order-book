import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { Auth } from "../middlewares/auth-middleware.js";
import { CreateAssetController } from "../controllers/asset/create-asset-controller.js";

export async function assetRoutes(fastify: FastifyTypedInstance) {
  fastify.post("/create", { preHandler: [Auth] }, async(req: FastifyRequest, rep: FastifyReply) => {
    return new CreateAssetController().handle(req, rep)
  })
}