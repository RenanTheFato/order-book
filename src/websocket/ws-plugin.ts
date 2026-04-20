import { FastifyTypedInstance } from "../../src/@types/fastify-types.js";
import fastifyWebSocket from "@fastify/websocket";
import { createMessageHandler } from "./ws-message-handler.js";

export async function wsPlugin(app: FastifyTypedInstance) {
  await app.register(fastifyWebSocket)

  app.get("/ws", { websocket: true }, (socket, request) => {
    const { onMessage, onClose } = createMessageHandler(socket, request.log)

    socket.on("message", onMessage)

    socket.on("close", onClose)

    socket.on("error", (err) => {
      request.log.error({ err }, "WebSocket Error")
    })
  })
}