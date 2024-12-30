import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { z } from "zod";

import { db } from "@/db/connection";
import dayjs from "dayjs";

export async function validateCode(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/authenticate/code',
      {
        schema: {
          body: z.object({
            code: z.string().max(4)
          })
        }
      },
      async (request, reply) => {
        const { code } = request.body

        const authCode = await db.authCode.findUnique({
          where: { code }
        })

        if (!authCode) {
          throw new Error('Invalid code.')
        }

        const diff = dayjs(new Date()).diff(authCode.expiredAt)

        if (diff > 10) {
          throw new Error('This code has expired')
        }

        const user = await db.user.findUnique({
          where: { id: authCode.userId }
        })

        if (!user) {
          throw new Error('Unauthorized')
        }

        await db.user.update({
          where: { id: authCode.userId },
          data: { isConfirmed: true }
        })

        await db.authCode.delete({
          where: { code }
        })

        return reply.send()
      })
}