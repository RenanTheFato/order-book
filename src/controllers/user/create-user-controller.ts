import { hash } from "bcryptjs";
import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodError } from "zod/v4";
import { CreateUserService } from "../../services/user/create-user-service.js";

export class CreateUserController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const userSchema = z.object({
      email: z.email({ error: "The value entered isn't an email or the email is invalid" })
        .min(2, { error: "The email doesn't meet the minimum number of characters (2)" }),

      name: z.string({ error: "The value must be an string for name" })
        .min(2, ({ error: "The name doesn't meet the minimum number of characters (2)" }))
        .max(128, { error: "The name has exceeded the character limit (128)." }),

      last_name: z.string({ error: "The value must be an string for last name" })
        .min(2, ({ error: "The name doesn't meet the minimum number of characters (2)" }))
        .max(128, { error: "The last name has exceeded the character limit (128)." }),

      password: z.string({ error: "The value must be an string for password" })
        .min(8, { error: "The password doesn't meet the minimum number of characters (8)." })
        .max(128, { error: "The password has exceeded the character limit (128)." })
        .refine((password) => /[A-Z]/.test(password), { error: "Password must contain at least one uppercase letter." })
        .refine((password) => /[0-9]/.test(password), { error: "Password must contain at least one number." })
        .refine((password) => /[@#$*&]/.test(password), { error: "Password must contain at least one of this special characters ('@' '#' '$' '*' '&')." }),
    })

    try {
      userSchema.parse(req.body)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          message: err.message,
          code: err.code,
          path: err.path.join("/")
        }))

        return rep.status(400).send({ error: "Validation Error Occurred", errors })
      }
    }

    const { email, name, last_name, password } = req.body as z.infer<typeof userSchema>

    const hashedPassword = await hash(password, 12)

    try {
      const createUserService = new CreateUserService()
      const user = await createUserService.execute({ email, name, last_name, hashed_password: hashedPassword })

      return rep.status(201).send({ message: "User created successfully", user })
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "Email is already in use":
            return rep.status(400).send({ error: error.message })
          default:
            return rep.status(500).send({ error: `Internal Server Error ${error.message}` })
        }
      }
      console.error(error)
    }
  }
}