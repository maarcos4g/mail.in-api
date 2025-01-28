import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import { z } from "zod";
import { db } from "@/db/connection";
import { ClientError } from "../_errors/client-error";
import { brevo } from "@/mail/client";

export async function requestSendEmail(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/send-email',
      {
        schema: {
          body: z.object({
            emailId: z.string().cuid()
          }),
          response: {
            200: z.object({
              message: z.string(),
            }),
          },
        }
      },
      async (request, reply) => {
        const { emailId } = request.body
        const userId = await request.getCurrentUserId()

        const email = await db.email.findUnique({
          where: {
            id: emailId
          },
          include: {
            emailList: true
          }
        })

        if (!email) {
          throw new ClientError('Email not found.')
        }

        await db.email.update({
          where: { id: emailId },
          data: {
            status: "QUEUE"
          },
        });

        await brevo.sendTransacEmail({
          subject: email.subject,
          htmlContent: email.content,
          sender: { name: 'mail.in', email: 'marcos.dev07@gmail.com' },
          to: email.emailList.senders.map((sender) => {
            return { email: sender, name: sender }
          }),
          replyTo: { email: 'naoresponda@mailin.com', name: 'Não responda' }
        })

        await db.email.update({
          where: { id: email.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
          }
        })

        return reply.status(200).send({ message: "Email added to queue and processing started" })
      })
}