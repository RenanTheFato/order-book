import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify.js";
import { CreateUserController } from "../controllers/user/create-user-controller.js";
import { AuthUserController } from "../controllers/user/auth-user-controller.js";

export async function userRoutes(fastify: FastifyTypedInstance){
  fastify.post("/user", async(req: FastifyRequest, rep: FastifyReply) => {
    return new CreateUserController().handle(req, rep)
  })

  fastify.post("/auth", async(req: FastifyRequest, rep: FastifyReply) => {
    return new AuthUserController().handle(req, rep)
  })
}