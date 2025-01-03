import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ClientError } from "../_errors/client-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { auth } from "@/http/middlewares/auth";

import { z } from "zod";
import { getUserPermissions } from "@/permissions";
import { db } from "@/db/connection";

export async function deleteTeam(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete('/team/:teamId',
      {
        schema: {
          params: z.object({
            teamId: z.string().uuid()
          }),
          response: {
            200: z.null()
          }
        }
      },
      async (request, reply) => {
        const { teamId } = request.params

        const team = await db.team.findUnique({
          where: { id: teamId }
        })

        if (!team) {
          throw new ClientError('Team not found.')
        }

        const userId = await request.getCurrentUserId()

        const { cannot } = await getUserPermissions(userId)

        if (await cannot('delete', 'Team', team.id)) {
          throw new UnauthorizedError(
            `You're not allowed to delete this team.`
          )
        }

        await db.team.delete({
          where: { id: teamId }
        })

        return reply.send()
      })
}