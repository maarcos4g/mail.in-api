import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import { z } from "zod";
import { db } from "@/db/connection";
import { ClientError } from "../_errors/client-error";
import { getUserPermissions } from "@/permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function revokeInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete('/revoke/:inviteId',
      {
        schema: {
          params: z.object({
            inviteId: z.string().cuid(),
          })
        }
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { inviteId } = request.params

        const invite = await db.invite.findUnique({
          where: {
            id: inviteId,
          }
        })

        if (!invite) {
          throw new ClientError('Invite not found')
        }

        const user = await db.user.findUnique({
          where: { id: userId }
        })

        if (!user) {
          throw new ClientError('User not found')
        }

        //verificando se o usuário que está deletando o convite é o destinatário do convite.
        const isGuest = invite.guestEmail === user.email

        const { cannot } = await getUserPermissions(userId)

        if (!isGuest && (await cannot('delete', 'Invite', invite.teamId!))) {
          throw new UnauthorizedError(`You're not allowed to delete this invite, because you aren't a owner of the team`)
        }

        await db.invite.delete({
          where: { id: invite.id }
        })

        return reply.send()
      })
}