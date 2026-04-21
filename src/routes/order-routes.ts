import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { Auth } from "../middlewares/auth-middleware.js";
import { CreateOrderController } from "../controllers/order/create-order-controller.js";

export async function orderRoutes(fastify: FastifyTypedInstance) {
  fastify.post("/create", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateOrderController().handle(req, rep)
  })
}