import { prisma } from "../../config/prisma.js";
import { BadRequestError } from "../../errors/index.js";
import { User } from "../../interfaces/user.js";

export class DeleteUserService {
  async execute({ id }: Pick<User, 'id'>): Promise<void> {
    const userIsRegistered = await prisma.users.findFirst({
      select: {
        id: true
      },
      where: {
        id
      }
    })

    if (!userIsRegistered) {
      throw new BadRequestError("Cannot be possible to delete user")
    }

    await prisma.users.delete({
      where: {
        id
      }
    })
  }
}