import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import { z } from "zod";
import { db } from "@/db/connection";
import { ClientError } from "../_errors/client-error";
import { getUserPermissions } from "@/permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function createEmail(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/email', {
      schema: {
        body: z.object({
          subject: z.string(),
          content: z.string(),
          emailListId: z.string().uuid(),
          status: z.enum(["DRAFT", "QUEUE", "SENT"]).optional()
        }),
        response: {
          201: z.object({
            emailId: z.string().cuid()
          })
        }
      }
    }, async (request, reply) => {
      const { subject, content, emailListId, status } = request.body

      const userId = await request.getCurrentUserId()

      const emailList = await db.emailList.findUnique({
        where: {
          id: emailListId
        }
      })

      if (!emailList) {
        throw new ClientError("Email list not found")
      }

      const { cannot } = getUserPermissions(userId)

      if (await cannot('read', 'EmailList', emailList.id)) {
        throw new UnauthorizedError(`You're not allowed to read data and create email in email list`)
      }

      const email = await db.email.create({
        data: {
          content,
          subject,
          title: subject,
          emailListId: emailList.id,
          status
        }
      })

      return reply.status(201).send({ emailId: email.id })
    })
}