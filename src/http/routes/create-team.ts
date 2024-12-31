import { db } from "@/db/connection";
import { generateSlug } from "@/utils/generate-slug";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { auth } from "@/http/middlewares/auth";

export async function createTeam(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/team',
      {
        schema: {
          body: z.object({
            name: z.string(),
          }),
          response: {
            201: z.object({
              teamId: z.string().uuid()
            })
          }
        }
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { name } = request.body

        const slug = generateSlug(name).toLowerCase()

        const team = await db.team.create({
          data: {
            name,
            ownerId: userId,
            slug,
            members: {
              connect: {
                id: userId,
              }
            }
          },
        })

        return reply.status(201).send({ teamId: team.id })
      })
}