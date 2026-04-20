import { FastifyTypedInstance } from "../../src/@types/fastify-types.js";
import fastifyWebSocket from "@fastify/websocket";

export async function wsPlugin(app: FastifyTypedInstance) {
  await app.register(fastifyWebSocket)

  app.get("/ws", { websocket: true }, (socket, request) => {
    request.log.info("New WS Connection Recived")

    socket.on("message", (rawMessage) => {
      request.log.info({ rawMessage: rawMessage.toString() }, "Message Recived");
    });

    socket.on("close", () => {
      request.log.info("WebSocket Connection Closed");
    });

    socket.on("error", (err) => {
      request.log.error({ err }, "Error on WebSocket");
    });
  })
}