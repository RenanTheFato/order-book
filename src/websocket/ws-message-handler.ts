import { WebSocket } from "@fastify/websocket";
import { FastifyBaseLogger } from "fastify";
import { parseMessage } from "./ws-message-parser.js";
import { connectionManager } from "./connection-manager.js";
import jwt from "jsonwebtoken";

interface handler {
  connection: string | null,
  authenticated: boolean,
  user_id: string | null
}

const ASSET_CHANNELS = new Set(["order-book", "trades"])
const PRIVATE_CHANNELS = new Set(["orders", "positions"])

function send(socket: WebSocket, payload: unknown) {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(payload))
  }
}

export function createMessageHandler(socket: WebSocket, log: FastifyBaseLogger) {
  const state: handler = {
    connection: null,
    authenticated: false,
    user_id: null
  }

  function handleAuth(token: string) {
    try {
      const decoded = jwt.verify(token, String(process.env.JWT_SECRET)) as { id: string }
      state.user_id = decoded.id
      state.authenticated = true

      state.connection = connectionManager.add(state.user_id, socket)
      send(socket, { event: "auth:success", user_id: state.user_id })
      log.info({ user_id: state.user_id }, "Authenticated")
    } catch (error) {
      send(socket, { event: "auth:error", message: "Invalid Token" })
      socket.close(1008, "Unauthorized")
    }
  }

  function handleSubscribe(channel: string, asset_id?: string) {
    if (ASSET_CHANNELS.has(channel)) {
      if (!asset_id) {
        send(socket, { event: "error", message: `Channel '${channel}' requires asset_id` })
        return
      }
      const fullChannel = `${channel}:${asset_id}`
      connectionManager.subscribe(state.connection!, fullChannel)
      send(socket, { event: "subscribed", channel: fullChannel })
      return
    }

    if (PRIVATE_CHANNELS.has(channel)) {
      const fullChannel = `${channel}:${state.user_id}`
      connectionManager.subscribe(state.connection!, fullChannel)
      send(socket, { event: "subscribed", channel })
      return
    }
  }

  function handleUnsubscribe(channel: string, asset_id?: string) {
    let fullChannel: string

    if (ASSET_CHANNELS.has(channel)) {
      if (!asset_id) {
        send(socket, { event: "error", message: `Channel ${channel} requires asset_id` })
        return
      }
      fullChannel = `${channel}:${asset_id}`
    } else {
      fullChannel = `${channel}:${state.user_id}`
    }

    connectionManager.unsubscribe(state.connection!, fullChannel)
    send(socket, { event: "unsubscribed", channel: fullChannel })
  }

  function onMessage(message: Buffer) {
    const parsed = parseMessage(message.toString())

    if (!parsed) {
      send(socket, { event: "error", message: "Invalid Message Format" })
      return
    }

    if (parsed.action === "auth") {
      handleAuth(parsed.token)
      return
    }

    if (parsed.action === "ping") {
      send(socket, { event: "pong" })
      return
    }

    if (!state.authenticated) {
      send(socket, { event: "error", message: "Not authenticated" })
      return
    }

    if (parsed.action === "subscribe") {
      handleSubscribe(parsed.channel, parsed.asset_id)
      return
    }

    if (parsed.action === "unsubscribe") {
      handleUnsubscribe(parsed.channel, parsed.asset_id)
      return
    }
  }

  function onClose() {
    if (state.connection) {
      connectionManager.remove(state.connection)
      log.info({ user_id: state.user_id }, "Disconnected")
    }
  }

  return { onMessage, onClose }
}