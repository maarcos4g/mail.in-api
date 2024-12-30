import { db } from "@/db/connection";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export async function getAllPlans(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/plans',
      {
        schema: {
          response: {
            200: z.object({
              plans: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  description: z.string(),
                  priceInCents: z.number().int()
                })
              )
            })
          }
        }
      },
      async (_, reply) => {
        const plans = await db.plan.findMany()

        return reply.send({ plans })
      })
}