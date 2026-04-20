import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { Auth } from "../middlewares/auth-middleware.js";
import { CreateDepositRequestController } from "../controllers/deposit/create-deposit-request-controller.js";
import { ConfirmDepositController } from "../controllers/deposit/confirm-deposit-controller.js";
import { CancelDepositController } from "../controllers/deposit/cancel-deposit-controller.js";
import { GetDepositController } from "../controllers/deposit/get-deposit-controller.js";

export async function depositRoutes(fastify: FastifyTypedInstance) {
  fastify.post("/request-deposit", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateDepositRequestController().hande(req, rep)
  })

  fastify.post("/confirm/:deposit_id", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new ConfirmDepositController().handle(req, rep)
  })

  fastify.post("/cancel/:deposit_id", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new CancelDepositController().handle(req, rep)
  })

  fastify.get("/view/:deposit_id", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new GetDepositController().handle(req, rep)
  })
}