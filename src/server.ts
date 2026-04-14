import { fastify, FastifyError } from "fastify";
import { fastifyCors } from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config()

const server = fastify({ logger: true })

const HTTP_PORT = process.env.HTTP_PORT
const HTTP_HOST = process.env.HTTP_HOST

server.register(fastifyCors)

server.listen({
  host: HTTP_HOST,
  port: Number(HTTP_PORT)
}).then(() => {
  console.log(`HTTP SERVER RUNNING ON PORT: ${HTTP_PORT}`)
}).catch((err: FastifyError) => {
  console.error(`ERROR ON TRYING TO RUN THE HTTP SERVER: ${err}`)
})