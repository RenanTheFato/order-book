import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../interfaces/user.js";
import { GetUserService } from "../../services/user/get-user-service.js";
import { NotFoundError } from "../../errors/index.js";

export class GetUserController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    try {
      const getUserService = new GetUserService()
      const user = await getUserService.execute({ id })

      return rep.status(200).send({ message: "Fetched Successfully", user })
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return rep.status(404).send({ error: error.message })
      }

      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}