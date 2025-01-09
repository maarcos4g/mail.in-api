import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import { z } from "zod";
import { db } from "@/db/connection";
import { ClientError } from "../_errors/client-error";
import { getUserPermissions } from "@/permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function getInvitesForTeam(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/invites/:teamSlug',
      {
        schema: {
          params: z.object({
            teamSlug: z.string(),
          }),
          response: {
            200: z.object({
              memberships: z.object({
                accepted: z.array(
                  z.object({
                    memberId: z.string().uuid(),
                    userId: z.string().uuid(),
                    memberName: z.string(),
                    memberAvatar: z.string().url().nullable(),
                  })
                ),
                waiting: z.array(
                  z.object({
                    invitationId: z.string().cuid(),
                    memberEmail: z.string(),
                  })
                )
              })
            })
          }
        }
      },
      async (request, reply) => {
        const { teamSlug } = request.params
        const userId = await request.getCurrentUserId()

        const team = await db.team.findUnique({
          where: { slug: teamSlug },
          include: {
            teamMembership: {
              where: {
                hasInvite: true,
              },
              include: {
                user: true,
              }
            }
          }
        })

        if (!team) {
          throw new ClientError('Team not found')
        }

        const { can, cannot } = await getUserPermissions(userId)

        if (await cannot('read', 'Team', team.id)) {
          throw new UnauthorizedError(`You're not allowed to view this team data.`)
        }

        const accepted = team.teamMembership.map((membership) => ({
          memberId: membership.id,
          userId: membership.userId,
          memberName: membership.user.fullName,
          memberAvatar: membership.user.avatarUrl,
        }))

        const invites = await db.invite.findMany({
          where: {
            teamId: team.id,
            hasAccepted: false,
          },
          include: {

          }
        })

        const waiting = invites.map((membership) => ({
          invitationId: membership.id,
          memberEmail: membership.guestEmail,
        }))

        return reply.status(200).send({ memberships: { accepted, waiting } })
      })
}
