import { prisma } from "../../config/prisma.js";
import { InvalidOperationError, NotFoundError } from "../../errors/index.js";
import { Order } from "../../interfaces/order.js";
import { User } from "../../interfaces/user.js";

interface GetOrder {
  id: User['id'],
  order_id: Order['id']
}

export class GetOrderService {
  async execute({ id, order_id }: GetOrder): Promise<Order> {
    const order = await prisma.orders.findFirst({
      where: {
        id: order_id,
      }
    })

    if (!order) {
      throw new NotFoundError("Order not found")
    }

    if (order.user_id !== id) {
      throw new InvalidOperationError("You are not allowed to view this order")
    }

    return order
  }
}