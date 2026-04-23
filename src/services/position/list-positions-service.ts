import { prisma } from "../../config/prisma.js";
import { NotFoundError } from "../../errors/index.js";
import { Position } from "../../interfaces/position.js";
import { User } from "../../interfaces/user.js";

export class ListPositionsService {
  async execute({ id }: Pick<User, 'id'>): Promise<Position[]> {
    const positions = await prisma.userPositions.findMany({
      where: {
        user_id: id
      }
    })

    if (positions.length === 0) {
      throw new NotFoundError("You don't have any position placed ")
    }

    return positions
  }
}