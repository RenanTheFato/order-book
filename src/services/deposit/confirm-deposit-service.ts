import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../../config/prisma.js";
import { Deposit } from "../../interfaces/deposit.js";
import { User } from "../../interfaces/user.js";
import { BadRequestError, InvalidOperationError, NotFoundError } from "../../errors/index.js";

interface ConfirmDeposit {
  id: User['id']
  deposit_id: Deposit['id']
}

export class ConfirmDepositService {
  async execute({ id, deposit_id }: ConfirmDeposit): Promise<{ amount: Decimal, deposit_time: string }> {
    const deposit = await prisma.deposits.findUnique({
      where: {
        id: deposit_id,
      }
    })

    if (!deposit) {
      throw new NotFoundError("Deposit not found")
    }

    if (deposit.requested_by_user != id) {
      throw new InvalidOperationError("Invalid operation, you can't confirm this deposit")
    }

    if (deposit.status === "SUCCESS") {
      throw new BadRequestError("This deposit has been already successfully confirmed")
    }

    if (deposit.status === "CANCELLED") {
      throw new BadRequestError("This deposit has been cancelled, make another request to generate a new deposit")
    }


    await prisma.$transaction(async (tx) => {
      const updated = await tx.deposits.updateMany({
        where: {
          id: deposit_id,
          status: "PENDING"
        },
        data: {
          status: "SUCCESS"
        }
      })

      if (updated.count === 0) {
        throw new BadRequestError("Failed to confirm the deposit")
      }
      await tx.users.update({
        where: {
          id,
        },
        data: {
          balance: { increment: deposit.amount }
        }
      })
    })

    return { amount: deposit.amount, deposit_time: Date.now().toString() }
  }
}