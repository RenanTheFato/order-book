import { fastify, FastifyError } from "fastify";
import { fastifyCors } from "@fastify/cors";
import dotenv from "dotenv";
import { routes } from "./routes/index.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";

dotenv.config()

const server = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

const HTTP_PORT = process.env.HTTP_PORT
const HTTP_HOST = process.env.HTTP_HOST

async function start() {
  await server.register(fastifyCors)
  await server.register(routes, { prefix: "/api/v1"})
  
  server.listen({
    host: HTTP_HOST,
    port: Number(HTTP_PORT)
  }).then(() => {
    console.log(`HTTP SERVER RUNNING ON PORT: ${HTTP_PORT}`)
  }).catch((err: FastifyError) => {
    console.error(`ERROR ON TRYING TO RUN THE HTTP SERVER: ${err}`)
  })
}

start()