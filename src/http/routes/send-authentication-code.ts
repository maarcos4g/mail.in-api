import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { db } from "@/db/connection";

import z from "zod";

import { generateCode } from "@/utils/generate-code";
import dayjs from "dayjs";
import { brevo } from "@/mail/client";
import { render } from "@react-email/render";
import { SendAuthCodeTemplate } from "@/mail/template/send-authentication-code";

import { ClientError } from "../_errors/client-error";

export async function sendAuthCode(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/authenticate',
      {
        schema: {
          body: z.object({
            email: z.string().email()
          }),
        }
      },
      async (request, reply) => {
        const { email } = request.body

        const userFromEmail = await db.user.findUnique({
          where: { email }
        })

        if (!userFromEmail) {
          throw new ClientError('User not found.')
        }

        const code = generateCode()
        const expiredAt = dayjs(new Date()).add(10, 'minutes').toDate()

        await db.authCode.create({
          data: {
            code,
            expiredAt,
            userId: userFromEmail.id,
          }
        })

        await brevo.sendTransacEmail({
          subject: '[mail.in] Código de confirmação',
          htmlContent: await render(SendAuthCodeTemplate({
            code,
            email
          })),
          sender: { name: 'mail.in Admin', email: 'marcos.dev07@gmail.com' },
          to: [{ email: userFromEmail.email, name: userFromEmail.firstName }],
          replyTo: { email: 'naoresponda@mailin.com', name: 'Não responda' }
        })
      })
}