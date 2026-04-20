import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import { userRoutes } from "./user-routes.js";
import { depositRoutes } from "./deposit-routes.js";
import { assetRoutes } from "./asset-routes.js";

export async function routes(fastify: FastifyInstance, plugins: FastifyPluginOptions) {
  fastify.get("/ping", async (req: FastifyRequest, rep: FastifyReply) => {
    rep.status(200).send({
      "message": "Request Accepted",
    })
  })

  await fastify.register(userRoutes, { prefix: "/user" })
  await fastify.register(depositRoutes, { prefix: "/deposit" })
  await fastify.register(assetRoutes, { prefix: "/asset" })
}