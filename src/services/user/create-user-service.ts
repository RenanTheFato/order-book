import { prisma } from "../../config/prisma.js";
import { User } from "../../interfaces/user.js";

export class CreateUserService{
  async execute({ email, name, last_name, hashed_password }: Pick<User, 'email' | 'name' | 'last_name' | 'hashed_password'>) : Promise<Partial<User>> {
    const verifyEmailInUse = await prisma.users.findUnique({
      where: {
        email,
      }
    })

    if (verifyEmailInUse) {
      throw new Error("Email is already in use")
    }

    const user = await prisma.users.create({
      data: {
        email,
        name,
        last_name, hashed_password
      },
      omit: {
        hashed_password: true
      }
    })

    return user
  }
}