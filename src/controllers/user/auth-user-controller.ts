import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodError } from "zod/v4";
import { AuthUserService } from "../../services/user/auth-user-service.js";

export class AuthUserController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const authSchema = z.object({
      email: z.email({ error: "The value entered isn't an email or the email is invalid" })
      .min(1, { error: "The email cannot be an empty value" }),
      password: z.string({ error: "The value must be an string for password" })
        .min(1, { error: "The password cannot be an empty value" })
    })

    try {
      authSchema.parse(req.body)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          code: err.code,
          message: err.message,
          path: err.path.join("/")
        }))
        return rep.status(400).send({ error: "Authorization Validation Error Occurred", errors })
      }
    }

    const { email, password } = req.body as z.infer<typeof authSchema>

    try {
      const authUserService = new AuthUserService()
      const token = await authUserService.execute({ email, hashed_password: password })

      return rep.status(200).send({ message: "User authenticated successfully", token })
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "Invalid email or password":
            return rep.status(401).send({ error: error.message })
          default:
            return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
        }
      }
      console.error(error)
    }
  }
}