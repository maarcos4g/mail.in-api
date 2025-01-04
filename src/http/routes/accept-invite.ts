import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import z from "zod";
import { db } from "@/db/connection";
import { ClientError } from "../_errors/client-error";

export async function acceptInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/accept-invite',
      {
        schema: {
          body: z.object({
            inviteId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              membershipId: z.string().uuid(),
            })
          }
        }
      },
      async (request, reply) => {
        const { inviteId } = request.body
        const userId = await request.getCurrentUserId()

        const invite = await db.invite.findUnique({
          where: { id: inviteId },
        })

        if (!invite) {
          throw new ClientError('Invite not exist.')
        }

        const guest = await db.user.findUnique({
          where: { id: userId }
        })

        const isSameUser = invite.guestEmail === guest?.email ? true : false

        //checando se o usuário que está tentando aceitar o convite é o mesmo que está logado, para evitaer invasões.
        if (!isSameUser) {
          throw new ClientError('The invitation you are trying to accept is invalid')
        }

          await db.invite.update({
            where: { id: inviteId },
            data: {
              guestId: userId,
              hasAccepted: true,
            }
          })

        const membership = await db.teamMembership.create({
          data: {
            hasInvite: true,
            invitationId: invite.id,
            teamId: invite.teamId!,
            userId,
          }
        })

        return reply.status(201).send({ membershipId: membership.id })
      })
}