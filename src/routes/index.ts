import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";

export async function routes(fastify: FastifyInstance, plugins: FastifyPluginOptions) {
  fastify.get("/ping", async (req: FastifyRequest, rep: FastifyReply) => {
    rep.status(200).send({
      "message": "Request Accepted",
    })
  })
}