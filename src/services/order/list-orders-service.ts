import { prisma } from "../../config/prisma.js";
import { NotFoundError } from "../../errors/index.js";
import { Order } from "../../interfaces/order.js";
import { User } from "../../interfaces/user.js";

export class ListOrdersService {
  async execute({ id }: Pick<User, 'id'>): Promise<Order[]> {
    const orders = await prisma.orders.findMany({
      where: {
        user_id: id
      }
    })

    if (orders.length === 0) {
      throw new NotFoundError("You don't have any order ")
    }

    return orders
  }
}