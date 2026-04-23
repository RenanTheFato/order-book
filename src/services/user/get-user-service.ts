import { prisma } from "../../config/prisma.js";
import { NotFoundError } from "../../errors/index.js";
import { User } from "../../interfaces/user.js";

export class GetUserService {
  async execute({ id }: Pick<User, 'id'>): Promise<Partial<User>> {
    const user = await prisma.users.findUnique({
      where: {
        id
      },
      select: {
        name: true,
        last_name: true,
        email: true,
        balance: true,
        created_at: true,
        updated_at: true
      }
    })

    if (!user) {
      throw new NotFoundError("User not found")
    }

    return user
  }
}