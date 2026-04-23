import { Decimal } from "@prisma/client/runtime/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodError } from "zod/v4";
import { User } from "../../interfaces/user.js";
import { CreateDepositRequestService } from "../../services/deposit/create-deposit-request-service.js";
import { BadRequestError } from "../../errors/index.js";

export class CreateDepositRequestController {
  async handle(req: FastifyRequest, rep: FastifyReply) {

    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    const depositSchema = z.object({
      amount: z.string({ error: "The value entered must be an string" })
        .min(1, { error: "The amount doesn't meet the minimum number of characters (1)" })
        .refine((val) => !isNaN(Number(val)) && Number.isFinite(Number(val)), { error: "The amount must be a valid number" })
        .refine((val) => !val.includes(","), { error: "Use a dot instead of a comma as decimal separator" })
        .refine((val) => {
          const parts = val.split(".")
          return parts.length <= 2 && parts.every(part => part.length > 0)
        }, { error: "The amount must have at most one decimal point with digits on both sides" })
        .refine((val) => {
          const parts = val.split(".")
          return parts.length === 1 || parts[1].length <= 2
        }, { error: "The amount must have at most 2 decimal places" })
        .refine((val) => {
          const integerPart = val.split(".")[0]
          return integerPart.length <= 8
        }, { error: "The amount integer part must have at most 8 digits" })
        .refine((val) => Number(val) > 0, { error: "The deposit must be greater than 0" }),
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

      return rep.status(201).send({ message: "Deposit Request has been Created With Successful. Confirm your deposit", deposit_request: depositRequest })
    } catch (error: unknown) {
      if (error instanceof BadRequestError) {
        return rep.status(400).send({ error: error.message })
      }
      console.log(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}