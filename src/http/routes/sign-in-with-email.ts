import { db } from "@/db/connection";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function signInWithEmail(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/sign-in',
      {
        schema: {
          body: z.object({
            email: z.string().email(),
          }),
          response: {
            200: z.object({
              token: z.string(),
            })
          }
        },
      },
      async (request, reply) => {

        const { email } = request.body

        let user = await db.user.findUnique({
          where: { email }
        })

        if (!user) {
          throw new UnauthorizedError(`You don't have an account yet.`)
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