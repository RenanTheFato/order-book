import { prisma } from "../../config/prisma.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { Order } from "../../interfaces/order.js";
import { User } from "../../interfaces/user.js";
import { publishOrderBookUpdate } from "../../websocket/publishers/order-book-publisher.js";
import { publishBalanceUpdate, publishOrderUpdate, publishPositionUpdate } from "../../websocket/publishers/user-publisher.js";

interface CancelOrder {
  id: User['id'],
  order_id: Order['id']
}

export class CancelOrderService {
  async execute({ id, order_id }: CancelOrder): Promise<Order> {
    const order = await prisma.orders.findUnique({
      where: { 
        id: order_id 
      },
    })

    if (!order) {
      throw new NotFoundError("Order not found")
    }

    if (order.user_id !== id) {
      throw new BadRequestError("You can only cancel your own orders")
    }

    if (order.status !== "OPEN" && order.status !== "PARTIALLY_FILLED") {
      throw new BadRequestError(`Order cannot be cancelled. Current status: ${order.status}`)
    }

    const remaining = order.quantity.sub(order.quantity_filled)

    const { cancelledOrder, updatedBalance, updatedPosition } =
      await prisma.$transaction(async (tx) => {
        const cancelledOrder = await tx.orders.update({
          where: {
            id: order_id
          },
          data: {
            status: "CANCELLED"
          },
        })

        let updatedBalance = null
        let updatedPosition = null

        if (order.side === "BUY") {
          const refund = order.price!.mul(remaining)

          const { balance } = await tx.users.update({
            where: {
              id,
            },
            data: {
              balance: { increment: refund }
            },
            select: {
              balance: true
            },
          })

          updatedBalance = balance
        }

        if (order.side === "SELL") {
          updatedPosition = await tx.userPositions.update({
            where: {
              user_id_asset_id: {
                user_id: id,
                asset_id: order.asset_id,
              },
            },
            data: {
              quantity_locked: { decrement: remaining },
            },
          })
        }

        return { cancelledOrder, updatedBalance, updatedPosition }
      })

    publishOrderUpdate(id, {
      id: order_id,
      status: "CANCELLED",
      quantity_filled: order.quantity_filled,
    })

    if (order.type === "LIMIT" && order.price) {
      await publishOrderBookUpdate(order.asset_id, [{
        price: order.price,
        side: order.side
      }])
    }

    if (order.side === "BUY" && updatedBalance !== null) {
      publishBalanceUpdate(id, updatedBalance)
    }

    if (order.side === "SELL" && updatedPosition !== null) {
      publishPositionUpdate(id, {
        asset_id: order.asset_id,
        quantity: updatedPosition.quantity,
        avg_price: updatedPosition.avg_price,
      })
    }

    return cancelledOrder
  }
}