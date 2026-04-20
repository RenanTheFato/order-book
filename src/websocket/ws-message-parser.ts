import { z } from "zod/v4";

const clientMessageSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("auth"),
    token: z.string()
  }),
  z.object({
    action: z.literal("subscribe"),
    channel: z.enum(["order-book", "trades", "orders", "positions"]),
    asset_id: z.uuid().optional()
  }),
  z.object({
    action: z.literal("unsubscribe"),
    channel: z.enum(["order-book", "trades", "orders", "positions"]),
    asset_id: z.uuid().optional()
  }),
  z.object({
    action: z.literal("ping")
  })
])

export type ClientMessage = z.infer<typeof clientMessageSchema>

export function parseMessage(raw: string): ClientMessage | null {
  try {
    const json = JSON.parse(raw)
    const result = clientMessageSchema.safeParse(json)
    return result.success ? result.data : null
  } catch {
    return null
  }
}