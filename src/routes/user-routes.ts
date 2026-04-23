import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../@types/fastify-types.js";
import { CreateUserController } from "../controllers/user/create-user-controller.js";
import { AuthUserController } from "../controllers/user/auth-user-controller.js";
import { Auth } from "../middlewares/auth-middleware.js";
import { DeleteUserController } from "../controllers/user/delete-user-controller.js";
import { GetUserController } from "../controllers/user/get-user-controller.js";

export async function userRoutes(fastify: FastifyTypedInstance) {
  fastify.post("/create", async (req: FastifyRequest, rep: FastifyReply) => {
    return new CreateUserController().handle(req, rep)
  })

  fastify.post("/auth", async (req: FastifyRequest, rep: FastifyReply) => {
    return new AuthUserController().handle(req, rep)
  })

  fastify.get("/profile", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new GetUserController().handle(req, rep)
  })

  fastify.delete("/exclude", { preHandler: [Auth] }, async (req: FastifyRequest, rep: FastifyReply) => {
    return new DeleteUserController().handle(req, rep)
  })
}