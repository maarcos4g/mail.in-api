import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import { z } from "zod";
import { db } from "@/db/connection";
import { getUserPermissions } from "@/permissions";
import { ClientError } from "../_errors/client-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function getEmailList(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/email-lists/:emailListId',
      {
        schema: {
          params: z.object({
            emailListId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              emailList: z.object({
                id: z.string().uuid(),
                name: z.string(),
                senders: z.string().array(),
                ownerId: z.string().uuid(),
                teamId: z.string().uuid(),
                createdAt: z.date(),
                updatedAt: z.date().nullable(),
              })
            })
          }
        }
      },
      async (request, reply) => {
        const { emailListId } = request.params
        const userId = await request.getCurrentUserId()

        const emailList = await db.emailList.findUnique({
          where: { id: emailListId }
        })

        if (!emailList) {
          throw new ClientError('Email List not found.')
        }

        const {cannot} = getUserPermissions(userId)

        if (await cannot('read', 'EmailList', emailList.id)) {
          throw new UnauthorizedError(`You're not allowed to read email list data.`)
        }

        return reply.status(200).send({ emailList })
      })
}