import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../interfaces/user.js";
import { DeleteUserService } from "../../services/user/delete-user-service.js";
import { BadRequestError } from "../../errors/index.js";

export class DeleteUserController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    try {
      const deleteUserService = new DeleteUserService()
      await deleteUserService.execute({ id })

      return rep.status(204).send({})
    } catch (error: unknown) {
      if (error instanceof BadRequestError) {
        return rep.status(400).send({ error: error.message })
      }
      
      console.error(error)
      return rep.status(500).send({ error: "Internal Server Error" })
    }
  }
}