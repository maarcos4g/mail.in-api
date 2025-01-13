import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { auth } from "@/http/middlewares/auth";
import { z } from "zod";
import { getUserPermissions } from "@/permissions";
import { ClientError } from "../_errors/client-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { db } from "@/db/connection";

export async function createEmailList(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/email-list',
      {
        schema: {
          body: z.object({
            name: z.string().min(4),
            senders: z.string().array(),
            teamId: z.string().uuid()
          }),
          response: {
            201: z.object({
              emailListId: z.string().uuid()
            })
          }
        }
      },
      async (request, reply) => {
        const { name, senders, teamId } = request.body

        const userId = await request.getCurrentUserId()

        const { cannot } = await getUserPermissions(userId)

        if (await cannot('create', 'EmailList', teamId)) {
          throw new UnauthorizedError(
            `You're not allowed to create email list.`
          )
        }

        const emailList = await db.emailList.create({
          data: {
            senders,
            name,
            teamId,
            ownerId: userId,
          }
        })

        const author = await db.user.findUnique({
          where: { id: userId },
          select: {
            firstName: true
          }
        })

        await db.activity.create({
          data: {
            authorId: userId,
            type: 'CREATE',
            subtype: 'EMAILLIST',
            authorName: author!.firstName,
            teamId,
          }
        })

        return reply.status(201).send({ emailListId: emailList.id })
      })
}