import { prisma } from "../../config/prisma.js"
import { InvalidOperationError, NotFoundError } from "../../errors/index.js"
import { Deposit } from "../../interfaces/deposit.js"
import { User } from "../../interfaces/user.js"

interface GetDeposit {
  id: User['id']
  deposit_id: Deposit['id']
}

export class GetDepositService {
  async execute({ id, deposit_id }: GetDeposit): Promise<Omit<Deposit, 'requested_by_user'>> {
    const deposit = await prisma.deposits.findUnique({
      where: {
        id: deposit_id,
      }
    })

    if (!deposit) {
      throw new NotFoundError("Deposit not found")
    }

    if (deposit.requested_by_user !== id) {
      throw new InvalidOperationError("You are not allowed to fetch this deposit")
    }

    const { requested_by_user, ...depositWithoutUser } = deposit

    return depositWithoutUser
  }
}