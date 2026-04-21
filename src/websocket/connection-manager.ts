import { WebSocket } from "@fastify/websocket";

interface Client {
  user_id: string,
  socket: WebSocket,
  subs: Set<string>
}

class WebSocketConnectionManager {
  private clients = new Map<string, Client>()
  private next = 0

  add(user_id: string, socket: WebSocket): string {
    const connection = `conn_${++this.next}`
    this.clients.set(connection, {
      user_id,
      socket,
      subs: new Set()
    })

    return connection
  }

  remove(connection: string): void {
    this.clients.delete(connection)
  }

  subscribe(connection: string, channel: string): void {
    const client = this.clients.get(connection)
    if (client) {
      client.subs.add(channel)
    }
  }

  unsubscribe(connection: string, channel: string): void {
    const client = this.clients.get(connection)
    if (client) {
      client.subs.delete(channel)
    }
  }

  broadcast(channel: string, payload: unknown): void {
    const message = JSON.stringify(payload)
    for (const client of this.clients.values()) {
      if (client.subs.has(channel) && client.socket.readyState === 1) {
        client.socket.send(message)
      }
    }
  }

  hasSubscribers(channel: string): boolean {
    for (const client of this.clients.values()) {
      if (client.subs.has(channel) && client.socket.readyState === 1) {
        return true
      }
    }
    return false
  }

  sendToUser(user_id: string, payload: unknown): void {
    const message = JSON.stringify(payload)
    for (const client of this.clients.values()) {
      if (client.user_id === user_id && client.socket.readyState === 1) {
        client.socket.send(message)
      }
    }
  }
}

export const connectionManager = new WebSocketConnectionManager()