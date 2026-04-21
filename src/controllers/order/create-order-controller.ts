import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodError } from "zod/v4";
import { User } from "../../interfaces/user.js";
import { OrderSide, OrderType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import { CreateOrderService } from "../../services/order/create-order-service.js";
import { BadRequestError } from "../../errors/index.js";

export class CreateOrderController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    const orderSchema = z.object({
      asset_id: z.uuid({ error: "The asset_id must be a valid UUID" }),
      side: z.enum(OrderSide, { error: "Order side must be BUY or SELL" }),
      type: z.enum(OrderType, { error: "Order side must be LIMIT or MARKET" }),
      price: z.string({ error: "The value must be an string for price" })
        .min(1, { error: "The price must not be empty" })
        .refine((val) => !isNaN(Number(val)) && Number.isFinite(Number(val)), { error: "The price must be a valid number" })
        .refine((val) => !val.includes(","), { error: "Use a dot instead of a comma as decimal separator for price" })
        .refine((val) => {
          const parts = val.split(".")
          return parts.length <= 2 && parts.every(part => part.length > 0)
        }, { error: "The price must have at most one decimal point with digits on both sides" })
        .refine((val) => {
          const parts = val.split(".")
          return parts.length === 1 || parts[1].length <= 8
        }, { error: "The price must have at most 8 decimal places" })
        .refine((val) => Number(val) > 0, { error: "The price must be greater than 0" })
        .optional(),
      quantity: z.string({ error: "The value must be a string for quantity" })
        .min(1, { error: "The quantity must not be empty" })
        .refine((val) => !isNaN(Number(val)) && Number.isFinite(Number(val)), { error: "The quantity must be a valid number" })
        .refine((val) => !val.includes(","), { error: "Use a dot instead of a comma as decimal separator for quantity" })
        .refine((val) => {
          const parts = val.split(".")
          return parts.length <= 2 && parts.every(part => part.length > 0)
        }, { error: "The quantity must have at most one decimal point with digits on both sides" })
        .refine((val) => {
          const parts = val.split(".")
          return parts.length === 1 || parts[1].length <= 8
        }, { error: "The quantity must have at most 8 decimal places" })
        .refine((val) => Number(val) > 0, { error: "The quantity must be greater than 0" }),
    }).refine((data) => {
      if (data.type === "LIMIT" && !data.price) return false
      if (data.type === "MARKET" && data.price) return false
      return true
    }, { error: "LIMIT orders require price. MARKET orders must not have price." })

    try {
      orderSchema.parse(req.body)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          message: err.message,
          code: err.code,
          path: err.path.join("/")
        }))

        return rep.status(400).send({ error: "Order Validation Error Occurred", errors })
      }
    }

    const { asset_id, side, type, price, quantity } = req.body as z.infer<typeof orderSchema>

    const parsedPrice = price ? new Decimal(price) : undefined
    const parsedQuantity = new Decimal(quantity)

    try {
      const createOrderService = new CreateOrderService()
      const order = await createOrderService.execute({ user_id: id, asset_id, side, type, price: parsedPrice, quantity: parsedQuantity })

      return rep.status(201).send({ message: "Order created successfully", order })
    } catch (error: unknown) {
      if (error instanceof BadRequestError) {
        return rep.status(400).send({ error: error.message })
      }

      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}