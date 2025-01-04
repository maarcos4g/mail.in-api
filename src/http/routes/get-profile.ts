import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import z from "zod";
import { db } from "@/db/connection";
import { ClientError } from "../_errors/client-error";

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/profile',
      {
        schema: {
          response: {
            200: z.object({
              user: z.object({
                id: z.string().uuid(),
                firstName: z.string(),
                fullName: z.string(),
                email: z.string().email(),
                avatarUrl: z.string().url().nullable(),
                plan: z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                }),
                teams: z.array(
                  z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    slug: z.string(),
                    ownerId: z.string(),
                  }),
                )
              })
            })
          }
        }
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await db.user.findUnique({
          where: { id: userId },
          include: {
            plan: true,
            teamMembership: {
              include: {
                team: true,
              }
            },
          }
        })

        if (!user) {
          throw new ClientError('User not exist')
        }

        const teams = user.teamMembership.map((membership) => ({
          id: membership.team.id,
          name: membership.team.name,
          slug: membership.team.slug,
          ownerId: membership.team.ownerId,
        }));

        return reply.status(200).send({
          user: { ...user, teams }
        })
      })
}