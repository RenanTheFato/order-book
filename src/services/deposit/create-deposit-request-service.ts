import { prisma } from "../../config/prisma.js";
import { Deposit } from "../../interfaces/deposit.js";
import { User } from "../../interfaces/user.js";

export class CreateDepositRequestService {
  async execute({ id }: Pick<User, 'id'>, { amount }: Pick<Deposit, 'amount'>): Promise<Partial<Deposit>> {
    const userIsRegistered = await prisma.users.findFirst({
      where: {
        id
      }
    })

    if (!userIsRegistered) {
      throw new Error("Cannot be possible to proceed, user is not registered")
    }

    const depositRequest = await prisma.deposits.create({
      data: {
        requested_by_user: id,
        amount,
      },
      select: {
        id: true,
        amount: true,
        status: true,
        created_at: true
      }
    })

    return depositRequest
  }
}