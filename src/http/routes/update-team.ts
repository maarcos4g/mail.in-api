import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ClientError } from "../_errors/client-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { auth } from "@/http/middlewares/auth";

import { z } from "zod";
import { getUserPermissions } from "@/permissions";
import { db } from "@/db/connection";

export async function updateTeam(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put('/team/:teamId',
      {
        schema: {
          body: z.object({
            name: z.string().min(4).optional(),
            slug: z.string().optional(),
          }),
          params: z.object({
            teamId: z.string().uuid()
          }),
          response: {
            204: z.null()
          }
        }
      },
      async (request, reply) => {
        const { name, slug } = request.body
        const { teamId } = request.params

        const team = await db.team.findUnique({
          where: { id: teamId }
        })

        if (!team) {
          throw new ClientError('Team not found.')
        }

        const userId = await request.getCurrentUserId()

        const { cannot } = await getUserPermissions(userId)

        if (await cannot('update', 'Team', team.id)) {
          throw new UnauthorizedError(
            `You're not allowed to update this team.`
          )
        }

        await db.team.update({
          data: {
            name,
            slug
          },
          where: { id: teamId }
        })

        return reply.status(204).send()
      })
}