import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import { getUserPermissions } from "@/permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { db } from "@/db/connection";
import { z } from "zod";

export async function getAllMyInvitations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/invites',
      {
        schema: {
          response: {
            200: z.object({
              invites: z.array(
                z.object({
                  id: z.string().cuid(),
                  guestId: z.string().uuid().nullable(),
                  guestEmail: z.string().email(),
                  inviter: z.object({
                    id: z.string().uuid(),
                    firstName: z.string(),
                  }).nullable(),
                  team: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    slug: z.string()
                  }).nullable()
                })
              )
            })
          }
        }
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { cannot } = await getUserPermissions(userId)

        if (await cannot('read', 'Invite', userId)) {
          throw new UnauthorizedError(`Your account isn't confirmed, so you cannot see invitations.`)
        }

        const user = await db.user.findUnique({
          where: { id: userId }
        })

        if (!user) {
          throw new UnauthorizedError()
        }

        const invites = await db.invite.findMany({
          where: {
            guestEmail: user.email,
            hasAccepted: false
          },
          include: {
            inviter: true,
            team: true,
          }
        })

        return reply.status(200).send({ invites })
      })
}