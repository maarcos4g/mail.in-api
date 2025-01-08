import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import { z } from "zod";
import { db } from "@/db/connection";
import { getUserPermissions } from "@/permissions";
import { ClientError } from "../_errors/client-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function getTeamForSlug(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/team/:slug',
      {
        schema: {
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              team: z.object({
                id: z.string().uuid(),
                slug: z.string(),
                name: z.string(),
                ownerId: z.string().uuid(),
                createdAt: z.date(),
                updatedAt: z.date(),
              })
            })
          }
        }
      },
      async (request, reply) => {
        const { slug } = request.params

        const team = await db.team.findUnique({
          where: { slug }
        })

        if (!team) {
          throw new ClientError('Team not found.')
        }

        return reply.status(200).send({ team })
      })
}