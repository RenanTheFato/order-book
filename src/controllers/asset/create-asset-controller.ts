import { Decimal } from "@prisma/client/runtime/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodError } from "zod/v4";
import { CreateAssetService } from "../../services/asset/create-asset-service.js";
import { BadRequestError } from "../../errors/index.js";

export class CreateAssetController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const assetSchema = z.object({
      name: z.string({ error: "The value must be an string for name" })
        .min(2, ({ error: "The name doesn't meet the minimum number of characters (2)" }))
        .max(128, { error: "The name has exceeded the character limit (128)." }),

      ticker: z.string({ error: "The value must be an string for ticker" })
        .min(3, ({ error: "The ticker doesn't meet the minimum number of characters (3)" }))
        .max(6, { error: "The ticker has exceeded the character limit (6)." }),

      total_supply: z.string({ error: "The value must be an string for total supply" })
        .min(1, { error: "The total supply must not be empty" })
        .refine((val) => !isNaN(Number(val)) && Number.isFinite(Number(val)), { error: "The total supply must be a valid number" })
        .refine((val) => !val.includes(","), { error: "Use a dot instead of a comma as decimal separator for total supply" })
        .refine((val) => {
          const parts = val.split(".")
          return parts.length <= 2 && parts.every(part => part.length > 0)
        }, { error: "The total supply must have at most one decimal point with digits on both sides" })
        .refine((val) => {
          const parts = val.split(".")
          return parts.length === 1 || parts[1].length <= 8
        }, { error: "The total supply must have at most 8 decimal places" })
        .refine((val) => {
          const integerPart = val.split(".")[0]
          return integerPart.length <= 10
        }, { error: "The total supply integer part must have at most 10 digits" })
        .refine((val) => Number(val) > 0, { error: "The total supply must be greater than 0" }),

      last_price: z.string({ error: "The value must be an string for last price" })
        .min(1, { error: "The last price must not be empty" })
        .refine((val) => !isNaN(Number(val)) && Number.isFinite(Number(val)), { error: "The last price must be a valid number" })
        .refine((val) => !val.includes(","), { error: "Use a dot instead of a comma as decimal separator for last price" })
        .refine((val) => {
          const parts = val.split(".")
          return parts.length <= 2 && parts.every(part => part.length > 0)
        }, { error: "The last price must have at most one decimal point with digits on both sides" })
        .refine((val) => {
          const parts = val.split(".")
          return parts.length === 1 || parts[1].length <= 8
        }, { error: "The last price must have at most 8 decimal places" })
        .refine((val) => {
          const integerPart = val.split(".")[0]
          return integerPart.length <= 10
        }, { error: "The last price integer part must have at most 10 digits" })
        .refine((val) => Number(val) > 0, { error: "The last price must be greater than 0" }),
    })

    try {
      assetSchema.parse(req.body)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          message: err.message,
          code: err.code,
          path: err.path.join("/")
        }))

        return rep.status(400).send({ error: "Asset Validation Error Occurred", errors })
      }
    }

    const { name, ticker, total_supply, last_price } = req.body as z.infer<typeof assetSchema>

    const totalSupplyParsed = new Decimal(total_supply)
    const lastPriceParsed = new Decimal(last_price)

    try {
      const createAssetService = new CreateAssetService()
      const asset = await createAssetService.execute({ name, ticker, total_supply: totalSupplyParsed, last_price: lastPriceParsed })

      return rep.status(201).send({ message: "Asset created successfully", asset })
    } catch (error: unknown) {
      if (error instanceof BadRequestError) {
        return rep.status(400).send({ error: error.message })
      }

      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}