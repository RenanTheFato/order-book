import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify.js";
import { CreateUserController } from "../controllers/user/create-user-controller.js";

export async function userRoutes(fastify: FastifyTypedInstance){
  fastify.post("/user", async(req: FastifyRequest, rep: FastifyReply) => {
    return new CreateUserController().handle(req, rep)
  })
}