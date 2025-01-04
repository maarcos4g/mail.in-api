import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import { z } from "zod";
import { getUserPermissions } from "@/permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { db } from "@/db/connection";
import { ClientError } from "../_errors/client-error";

export async function getAllEmailList(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/email-list/:teamId',
      {
        schema: {
          params: z.object({
            teamId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              emailLists: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  senders: z.string().array(),
                  ownerId: z.string().uuid(),
                  team: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    ownerId: z.string().uuid(),
                    slug: z.string(),
                  })
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
          throw new UnauthorizedError(`You're not allowed to read team data.`)
        }

        const team = await db.team.findUnique({
          where: { id: teamId }
        })

        if (!team) {
          throw new ClientError('Team not found')
        }

        const emailLists = await db.emailList.findMany({
          where: {
            teamId,
          },
          include: {
            team: true,
          },
        })

        return reply.status(200).send({ emailLists })
      }
    )
}