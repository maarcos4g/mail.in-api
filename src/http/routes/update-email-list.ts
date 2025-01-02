import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ClientError } from "../_errors/client-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { auth } from "@/http/middlewares/auth";

import { z } from "zod";
import { getUserPermissions } from "@/permissions";
import { db } from "@/db/connection";

export async function updateEmailList(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put('/email-list/:id',
      {
        schema: {
          body: z.object({
            name: z.string().min(4),
            senders: z.string().array(),
            teamId: z.string().uuid()
          }),
          params: z.object({
            emailListId: z.string().uuid()
          }),
          response: {
            204: z.null()
          }
        }
      },
      async (request, reply) => {
        const { name, senders } = request.body
        const { emailListId } = request.params

        const emailList = await db.emailList.findUnique({
          where: { id: emailListId }
        })

        if (!emailList) {
          throw new ClientError('Email List not found.')
        }

        const userId = await request.getCurrentUserId()

        const { cannot } = await getUserPermissions(userId)

        if (await cannot('update', 'EmailList', emailList.teamId)) {
          throw new UnauthorizedError(
            `You're not allowed to update this email list.`
          )
        }

        await db.emailList.update({
          data: {
            senders,
            name,
          },
          where: { id: emailListId }
        })

        return reply.status(201).send()
      })
}