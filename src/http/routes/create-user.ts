import { db } from "@/db/connection";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function createUser(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/user',
      {
        schema: {
          body: z.object({
            planId: z.string().uuid(),
            name: z.string(),
            email: z.string().email(),
            avatarUrl: z.string().url().optional(),
          }),
          response: {
            201: z.object({
              token: z.string(),
            })
          }
        },
      },
      async (request, reply) => {

        const { email, name, planId, avatarUrl } = request.body

        let user = await db.user.findUnique({
          where: { email }
        })

        if (!user) {

          const firstName = name.split(' ')[0]

          user = await db.user.create({
            data: {
              email,
              fullName: name,
              avatarUrl,
              firstName,
              planId,
            },
          })
        }

        const token = await reply.jwtSign(
          {
            sub: user.id
          },
          {
            sign: {
              expiresIn: '7d'
            }
          }
        )

        return reply.status(201).send({ token })
      })
}