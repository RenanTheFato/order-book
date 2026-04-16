import { prisma } from "../../config/prisma.js"
import { NotFoundError, InvalidOperationError, BadRequestError } from "../../errors/index.js"
import { Deposit } from "../../interfaces/deposit.js"
import { User } from "../../interfaces/user.js"

interface CancelDeposit {
  id: User['id']
  deposit_id: Deposit['id']
}

export class CancelDepositService {
  async execute({ id, deposit_id }: CancelDeposit): Promise<void> {
    const deposit = await prisma.deposits.findUnique({
      where: {
        id: deposit_id,
      }
    })

    if (!deposit) {
      throw new NotFoundError("Deposit not found")
    }

    if (deposit.requested_by_user !== id) {
      throw new InvalidOperationError("Invalid operation, you can't cancel this deposit")
    }

    if (deposit.status === "SUCCESS") {
      throw new BadRequestError("This deposit has been confirmed, not able to cancel")
    }

    if (deposit.status === "CANCELLED") {
      throw new BadRequestError("This deposit has been already cancelled")
    }

    const result = await prisma.deposits.updateMany({
      where: {
        id: deposit_id,
        requested_by_user: id,
        status: "PENDING"
      },
      data: {
        status: "CANCELLED"
      }
    })

    if (result.count === 0) {
      throw new BadRequestError("Deposit could not be cancelled")
    }

    return
  }
}