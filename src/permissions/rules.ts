import { db } from "@/db/connection"

export const rules = {
  create: {
    EmailList: async (userId: string, teamId: string) => {
      const membership = await db.teamMembership.findUnique({
        where: {
          userId_teamId: {
            userId,
            teamId,
          }
        }
      })

      return Boolean(membership)
    },
    Invite: async (userId: string, teamId: string, guestEmail: string) => {
      const membership = await db.teamMembership.findUnique({
        where: {
          userId_teamId: {
            userId,
            teamId,
          }
        }
      })

      if (!membership) {
        return false
      }

      const existingInvite = await db.invite.findFirst({
        where: {
          teamId,
          guestEmail
        }
      })

      return !existingInvite
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
    },
    Team: async (userId: string, teamId: string) => {
      const team = await db.team.findUnique({
        where: { id: teamId }
      })
      return team?.ownerId === userId
    },
    TeamMembership: async (userId: string, teamId: string, memberId: string) => {
      const team = await db.team.findUnique({
        where: { id: teamId }
      })
      
      //verifica se o time existe e se o usuário é o 'owner' do time
      if (team?.ownerId !== userId) {
        return false
      }

      //verifica se  o membro que será alterado existe no time
      const membership = await db.teamMembership.findUnique({
        where: {
          userId_teamId: {
            userId: memberId,
            teamId,
          }
        }
      })

      return Boolean(membership)
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
    },
    Team: async (userId: string, teamId: string) => {
      const team = await db.team.findUnique({
        where: { id: teamId }
      })
      return team?.ownerId === userId
    },
    Invite: async (userId: string, teamId: string) => {
      const team = await db.team.findUnique({
        where: { id: teamId }
      })

      return team?.ownerId === userId
    },
    TeamMembership: async (userId: string, teamId: string, memberId: string) => {
      const team = await db.team.findUnique({
        where: { id: teamId }
      })
      
      //verifica se o time existe e se o usuário é o 'owner' do time
      if (team?.ownerId !== userId) {
        return false
      }

      //verifica se  o membro que será removido existe no time
      const membership = await db.teamMembership.findUnique({
        where: {
          userId_teamId: {
            userId: memberId,
            teamId,
          }
        }
      })

      return Boolean(membership)
    }
  },
  read: {
    Team: async (userId: string, teamId: string) => {
      const membership = await db.teamMembership.findUnique({
        where: {
          userId_teamId: { userId, teamId },
        },
      });
      return Boolean(membership);
    },
  },
  
}