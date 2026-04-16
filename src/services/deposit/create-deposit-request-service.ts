import { prisma } from "../../config/prisma.js";
import { Deposit } from "../../interfaces/deposit.js";
import { User } from "../../interfaces/user.js";

interface CreateDepositRequest {
  id: User['id']
  amount: Deposit['amount']
}

export class CreateDepositRequestService {
  async execute({ id, amount }: CreateDepositRequest): Promise<Partial<Deposit>> {
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