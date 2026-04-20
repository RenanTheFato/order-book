import { prisma } from "../../config/prisma.js"
import { NotFoundError } from "../../errors/index.js"
import { Deposit } from "../../interfaces/deposit.js"
import { User } from "../../interfaces/user.js"

export class ListDepositsService {
  async execute({ id }: Pick<User, 'id'>) : Promise<Omit<Deposit, 'requested_by_user'>[]> {
    const deposits = await prisma.deposits.findMany({
      where: {
        requested_by_user: id,
      },
      select: {
        id: true,
        amount: true,
        status: true,
        created_at: true,
        updated_at: true,
      }
    })

    if (deposits.length === 0) {
      throw new NotFoundError("You haven't made any deposits")
    }

    return deposits

  }
}