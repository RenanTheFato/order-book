import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { Auth } from "../middlewares/auth-middleware.js";
import { CreateDepositRequestController } from "../controllers/deposit/create-deposit-request-controller.js";

export async function depositRoutes(fastify: FastifyTypedInstance){
  fastify.post("/request-deposit", { preHandler: [Auth] }, async(req: FastifyRequest, rep: FastifyReply) =>{
    return new CreateDepositRequestController().hande(req, rep)
  })
}