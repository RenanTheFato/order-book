import { FastifyReply, FastifyRequest } from "fastify";
import { Deposit } from "../../interfaces/deposit.js";
import { User } from "../../interfaces/user.js";
import { CancelDepositService } from "../../services/deposit/cancel-deposit-service.js";
import { BadRequestError, InvalidOperationError, NotFoundError } from "../../errors/index.js";

export class CancelDepositController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, 'id'>
    const { deposit_id } = req.params as { deposit_id: Deposit['id'] }

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    if (!deposit_id) {
      return rep.status(400).send({ error: "The deposit id is missing" })
    }

    try {
      const cancelDepositService = new CancelDepositService()
      await cancelDepositService.execute({ id, deposit_id })

      return rep.status(200).send({ message: "Deposit cancelled successfully" })
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return rep.status(404).send({ error: error.message })
      }

      if (error instanceof InvalidOperationError) {
        return rep.status(403).send({ error: error.message })
      }

      if (error instanceof BadRequestError) {
        return rep.status(400).send({ error: error.message })
      }

      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}