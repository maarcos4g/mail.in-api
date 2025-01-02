import { db } from "@/db/connection"

export const rules = {
  create: {
    EmailList: async (userId: string, teamId: string) => {
      const team = await db.team.findUnique({
        where: { id: teamId }
      })
      return team?.ownerId === userId
    }
  },
  update: {
    EmailList: async (userId: string, teamId: string, emailListId: string) => {
      const team = await db.team.findUnique({
        where: { id: teamId }
      })

      const emailList = await db.emailList.findUnique({
        where: { id: emailListId }
      })

      return team?.ownerId === userId || emailList?.ownerId === userId
    }
  },
  delete: {
    EmailList: async (userId: string, teamId: string, emailListId: string) => {
      const team = await db.team.findUnique({
        where: { id: teamId }
      })

      const emailList = await db.emailList.findUnique({
        where: { id: emailListId }
      })

      return team?.ownerId === userId || emailList?.ownerId === userId
    }
  }
}