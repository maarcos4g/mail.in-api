import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import { z } from "zod";
import { getUserPermissions } from "@/permissions";
import { db } from "@/db/connection";
import { ClientError } from "../_errors/client-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function getAllEmails(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/emails/:emailListId',
      {
        schema: {
          params: z.object({
            emailListId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              emails: z.array(
                z.object({
                  id: z.string().cuid(),
                  subject: z.string(),
                  content: z.string(),
                  status: z.enum(["DRAFT", "QUEUE", "SENT"]),
                  emailList: z.object({
                    senders: z.string().array()
                  }),
                  createdAt: z.date(),
                  sentAt: z.date().nullable(),
                })
              )
            })
          }
        }
      },
      async (request, reply) => {
        const { emailListId } = request.params
        const userId = await request.getCurrentUserId()

        const { cannot } = getUserPermissions(userId)

        const emailList = await db.emailList.findUnique({
          where: {
            id: emailListId
          }
        })

        if (!emailList) {
          throw new ClientError('Email list not found.')
        }

        if (await cannot('read', 'EmailList', emailList.id)) {
          throw new UnauthorizedError(`You're not allowed to read emails from this email list`)
        }

        const emails = await db.email.findMany({
          where: {
            emailListId: emailList.id,
          },
          include: {
            emailList: true
          }
        })

        return reply.status(200).send({ emails })
      })
}