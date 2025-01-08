import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import { z } from "zod";
import { db } from "@/db/connection";
import { ClientError } from "../_errors/client-error";
import { getUserPermissions } from "@/permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { brevo } from "@/mail/client";
import { render } from "@react-email/render";
import { SendInviteLinkTemplate } from "@/mail/template/send-invite-link";
import { generateInvitationUrl } from "@/utils/generate-invitation-url";

export async function createInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/invite',
      {
        schema: {
          body: z.object({
            teamId: z.string().uuid(),
            guestEmail: z.string().email()
          }),
          response: {
            201: z.object({
              inviteId: z.string().cuid()
            })
          }
        }
      },
      async (request, reply) => {
        const { guestEmail, teamId } = request.body
        const userId = await request.getCurrentUserId()

        const team = await db.team.findUnique({
          where: {
            id: teamId,
          }
        })

        if (!team) {
          throw new ClientError('Team not found.')
        }

        const { can, cannot } = getUserPermissions(userId)

        if (await cannot('read', 'Team', teamId)) {
          throw new UnauthorizedError(`
            You're not allowed to read this team data.`)
        }

        if (await can('create', 'Invite', teamId, guestEmail)) {
          const userExist = await db.user.findUnique({
            where: { email: guestEmail }
          })

          const invite = await db.invite.create({
            data: {
              guestEmail,
              guestId: userExist?.id ? userExist.id : null,
              inviterId: userId,
              teamId: teamId,
            },
            include: {
              inviter: true
            }
          })

          await brevo.sendTransacEmail({
            subject: '[mail.in] Convite de colaboração',
            htmlContent: await render(SendInviteLinkTemplate({
              teamName: team.name,
              inviteLink: generateInvitationUrl(team.slug, invite.id),
              inviterName: invite.inviter!.firstName,
            })),
            sender: { name: 'mail.in Admin', email: 'marcos.dev07@gmail.com' },
            to: [{ email: guestEmail, name: userExist?.firstName ? userExist.firstName : 'Anonymous' }],
            replyTo: { email: 'naoresponda@mailin.com', name: 'Não responda' }
          })

          return reply.status(201).send({ inviteId: invite.id })
        }

        throw new UnauthorizedError(`
          You cannot send an invitation for this user or an invitation already exists for this user.`)

      })
}