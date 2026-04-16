import { compare } from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { User } from "../../interfaces/user.js";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../errors/index.js";

export class AuthUserService{
  async execute({ email, hashed_password: password } : Pick<User, 'email' | 'hashed_password'>) : Promise<String>{
    const userIsRegistered = await prisma.users.findFirst({
      where: {
        email
      }
    })

    if (!userIsRegistered) {
      throw new UnauthorizedError("Invalid email or password")
    }
    
    const checkPassword = await compare(password, userIsRegistered.hashed_password)
    
    if (!checkPassword) {
      throw new UnauthorizedError("Invalid email or password")
    }

    const token = jwt.sign({ id: userIsRegistered.id }, String(process.env.JWT_SECRET), { expiresIn: "2h" })

    return token
  }
}