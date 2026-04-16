import { Decimal } from "@prisma/client/runtime/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodError } from "zod/v4";
import { User } from "../../interfaces/user.js";
import { CreateDepositRequestService } from "../../services/deposit/create-deposit-request-service.js";

export class CreateDepositRequestController {
  async hande(req: FastifyRequest, rep: FastifyReply) {

    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    const depositSchema = z.object({
      amount: z.string({ error: "The value entered must be an string" })
        .min(1, { error: "The amount doesn't meet the minimum number of characters (1)" }),
    })

    try {
      depositSchema.parse(req.body)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          code: err.code,
          message: err.message,
          path: err.path.join("/")
        }))
        return rep.status(400).send({ error: "Depoist Validation Error Occurred", errors })
      }
    }

    const { amount } = req.body as z.infer<typeof depositSchema>

    const amountParsed = new Decimal(amount)

    try {
      const createDepositRequestService = new CreateDepositRequestService()
      const depositRequest = await createDepositRequestService.execute({ id, amount: amountParsed })

      return rep.status(201).send({ message: "Deposit Request has been Created With Successful. Confirm your deposit", deposit_request: depositRequest})
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "Cannot be possible to proceed, user is not registered":
            return rep.status(400).send({ error: error.message })
          default:
            return rep.status(500).send({ error: "Internal Server Error"})
        }
      }
      console.log(error)
    }
  }
}