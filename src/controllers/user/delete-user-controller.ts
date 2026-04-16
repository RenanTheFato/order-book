import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../interfaces/user.js";
import { DeleteUserService } from "../../services/user/delete-user-service.js";

export class DeleteUserController{
  async handle(req: FastifyRequest, rep: FastifyReply){
    const { id } = req.user as Pick<User, 'id'>

    if (!id) {
      return rep.status(400).send({ error: "The id is missing" })
    }

    try {
      const deleteUserService = new DeleteUserService()
      await deleteUserService.execute({ id })

      return rep.status(204).send({})
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "Cannot be possible to delete user":
            return rep.status(400).send({ error: error.message })
          default:
            return rep.status(500).send({ error: "Internal Server Error"})
        }
      }
      console.error(error)
    }
  }
}