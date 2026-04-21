
import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../../config/prisma.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { Order } from "../../interfaces/order.js";
import { MatchingEngine } from "../../websocket/services/matching-engine.js";

export class CreateOrderService {
  async execute({ user_id, asset_id, side, type, price, quantity }: Pick<Order, "user_id" | "asset_id" | "side" | "type" | "price" | "quantity">): Promise<Order> {

    if (type === "LIMIT" && !price) {
      throw new BadRequestError("Price is required for LIMIT orders")
    }

    if (type === "MARKET" && price) {
      throw new BadRequestError("MARKET orders must not have a price")
    }

    const asset = await prisma.assets.findUnique({
      where: {
        id: asset_id
      }
    })

    if (!asset) {
      throw new NotFoundError("Asset not found")
    }
    if (asset.status !== "ACTIVE") {
      throw new BadRequestError("This asset is not available for trading")
    }

    const order = await prisma.$transaction(async (tx) => {

      if (side === "BUY") {
        const user = await tx.users.findUnique({
          where: {
            id: user_id
          },
          select: {
            balance: true
          },
        })

        if (!user) {
          throw new NotFoundError("User not found")
        }

        const referencePrice = type === "LIMIT" ? price! : asset.last_price
        const requiredBalance = referencePrice.mul(quantity)

        if (user.balance.lt(requiredBalance)) {
          throw new BadRequestError(`Insufficient balance. Required: ${requiredBalance.toFixed(2)}, Available: ${user.balance.toFixed(2)}`)
        }

        await tx.users.update({
          where: {
            id: user_id
          },
          data: {
            balance: { decrement: requiredBalance }
          },
        })
      }

      if (side === "SELL") {
        const position = await tx.userPositions.findUnique({
          where: {
            user_id_asset_id: {
              user_id, asset_id
            }
          },
        })

        if (!position) {
          throw new BadRequestError("You don't have a position in this asset")
        }

        const availableQuantity = position.quantity.sub(position.quantity_locked)

        if (availableQuantity.lt(quantity)) {
          throw new BadRequestError(`Insufficient available quantity. Required: ${quantity.toFixed(8)}, Available: ${availableQuantity.toFixed(8)}`)
        }

        await tx.userPositions.update({
          where: {
            user_id_asset_id: {
              user_id, asset_id
            }
          },
          data: {
            quantity_locked: { increment: quantity }
          },
        })
      }
      return tx.orders.create({
        data: {
          user_id,
          asset_id,
          side,
          type,
          status: "OPEN",
          price: price ?? null,
          quantity,
          quantity_filled: new Decimal(0),
        },
      })
    })


    const referencePrice = type === "LIMIT" ? price! : asset.last_price
    const engine = new MatchingEngine()

    await engine.match(order, referencePrice)
    return order
  }
}