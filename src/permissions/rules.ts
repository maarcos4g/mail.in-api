import { db } from "@/db/connection"

export const rules = {
  create: {
    EmailList: async (userId: string, teamId: string) => {
      const team = await db.team.findUnique({
        where: { id: teamId }
      })
      return team?.ownerId === userId
    }
  }
}