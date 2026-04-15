import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../config/prisma.js";
import jwt from "jsonwebtoken";

export async function Auth(req: FastifyRequest, rep: FastifyReply): Promise<void> {
  const { authorization } = req.headers

  if (!authorization) {
    return rep.status(401).send({ error: "Bearer Token Missing" })
  }

  const token = authorization.split(" ")[1]

  try {
    const { id } = jwt.verify(token, String(process.env.JWT_SECRET)) as { id: string }

    const user = await prisma.users.findFirst({
      where: {
        id
      },
      omit: {
        hashed_password: true
      }
    })

    if (!user) {
      return rep.status(401).send({ error: "Unauthorized" })
    }

    req.user = user

    return

  } catch (error: unknown) {
    if (error instanceof Error) {
      switch (error.name) {
        case "JsonWebTokenError":
          return rep.status(401).send({ error: 'Invalid token' })
        case "TokenExpiredError":
          return rep.status(401).send({ error: 'Token expired' })
        default:
          return rep.status(500).send({ error: `Internal Server Error: ${error.message}` })
      }
    }
    console.log(error)
  }
}