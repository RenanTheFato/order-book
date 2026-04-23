import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { Auth } from "../middlewares/auth-middleware.js";
import { ListPositionsController } from "../controllers/position/list-positions-controller.js";

export async function positionRoutes(fastify: FastifyTypedInstance) {
  fastify.get("/list", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ListPositionsController().handle(req, rep)
  })
}