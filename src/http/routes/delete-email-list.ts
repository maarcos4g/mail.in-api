import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ClientError } from "../_errors/client-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { auth } from "@/http/middlewares/auth";

import { z } from "zod";
import { getUserPermissions } from "@/permissions";
import { db } from "@/db/connection";

export async function deleteEmailList(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete('/email-list/:emailListId',
      {
        schema: {
          params: z.object({
            emailListId: z.string().uuid()
          }),
          response: {
            200: z.null()
          }
        }
      },
      async (request, reply) => {
        const { emailListId } = request.params

        const emailList = await db.emailList.findUnique({
          where: { id: emailListId }
        })

        if (!emailList) {
          throw new ClientError('Email List not found.')
        }

        const userId = await request.getCurrentUserId()

        const { cannot } = await getUserPermissions(userId)

        if (await cannot('delete', 'EmailList', emailList.teamId, emailList.id)) {
          throw new UnauthorizedError(
            `You're not allowed to delete this email list.`
          )
        }

        await db.emailList.delete({
          where: { id: emailListId }
        })

        return reply.status(200).send()
      })
}