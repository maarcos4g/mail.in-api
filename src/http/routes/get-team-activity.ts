import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "@/http/middlewares/auth";
import { z } from "zod";
import { getUserPermissions } from "@/permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { db } from "@/db/connection";

export async function getTeamActivity(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/activity/:teamId',
      {
        schema: {
          params: z.object({
            teamId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              activities: z.array(
                z.object({
                  id: z.string().cuid(),
                  type: z.enum(['MEMBERSHIP', 'CREATE']),
                  teamId: z.string().uuid(),
                  authorName: z.string(),
                  authorId: z.string().uuid(),
                  subtype: z.enum(['EMAILLIST', 'EMAIL']).nullable(),
                  createdAt: z.date(),
                })
              )
            })
          }
        }
      },
      async (request, reply) => {
        const { teamId } = request.params
        const userId = await request.getCurrentUserId()

        const { cannot } = await getUserPermissions(userId)

        if (await cannot('read', 'Team', teamId)) {
          throw new UnauthorizedError(`You're not allowed read team member, because you're not a member.`)
        }

        const activities = await db.activity.findMany({
          where: { teamId },
          orderBy: {
            createdAt: 'desc',
          },
          take: 7,
        })

        return reply.status(200).send({ activities })
      })
}