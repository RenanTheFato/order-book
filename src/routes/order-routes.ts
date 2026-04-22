import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { Auth } from "../middlewares/auth-middleware.js";
import { CreateOrderController } from "../controllers/order/create-order-controller.js";
import { GetOrderController } from "../controllers/order/get-order-controller.js";
import { ListOrdersController } from "../controllers/order/list-orders-controller.js";
import { CancelOrderController } from "../controllers/order/cancel-order-controller.js";

export async function orderRoutes(fastify: FastifyTypedInstance) {
  fastify.post("/create", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateOrderController().handle(req, rep)
  })

  fastify.get("/view/:order_id", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new GetOrderController().handle(req, rep)
  })

  fastify.get("/list", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ListOrdersController().handle(req, rep)
  })

  fastify.delete("/cancel/:order_id", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CancelOrderController().handle(req, rep)
  })
}