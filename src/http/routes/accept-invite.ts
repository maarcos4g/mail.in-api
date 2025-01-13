import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import z from "zod";
import { db } from "@/db/connection";
import { ClientError } from "../_errors/client-error";
import { brevo } from "@/mail/client";
import { render } from "@react-email/render";
import { NotifyAcceptedInviteToInviter } from "@/mail/template/notification-inviter-accepted-invite";
import { NotifyAcceptedInviteToOwner } from "@/mail/template/notification-owner-accepted-invite";

export async function acceptInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/accept-invite',
      {
        schema: {
          body: z.object({
            inviteId: z.string().cuid(),
          }),
          response: {
            200: z.object({
              membershipId: z.string().uuid(),
            })
          }
        }
      },
      async (request, reply) => {
        const { inviteId } = request.body
        const userId = await request.getCurrentUserId()

        const invite = await db.invite.findUnique({
          where: { id: inviteId },
          include: {
            inviter: true,
            team: true,
          }
        })

        if (!invite) {
          throw new ClientError('Invite not exist.')
        }

        const guest = await db.user.findUnique({
          where: { id: userId }
        })

        const isSameUser = invite.guestEmail === guest?.email ? true : false

        //checando se o usuário que está tentando aceitar o convite é o mesmo que está logado, para evitaer invasões.
        if (!isSameUser) {
          throw new ClientError('The invitation you are trying to accept is invalid')
        }

        await db.invite.update({
          where: { id: inviteId },
          data: {
            guestId: userId,
            hasAccepted: true,
          }
        })

        const membership = await db.teamMembership.create({
          data: {
            hasInvite: true,
            invitationId: invite.id,
            teamId: invite.teamId!,
            userId,
          }
        })

        await db.activity.create({
          data: {
            authorId: guest?.id!,
            authorName: guest?.firstName!,
            type: 'MEMBERSHIP',
            teamId: invite.teamId!,
          }
        })

        const inviterIsTeamOwner = invite.inviterId === invite.team?.ownerId ? true : false

        await brevo.sendTransacEmail({
          subject: '[mail.in] Convite de colaboração aceito!',
          htmlContent: await render(NotifyAcceptedInviteToInviter({
            guestEmail: invite.guestEmail
          })),
          sender: { name: 'mail.in Admin', email: 'marcos.dev07@gmail.com' },
          to: [{ email: invite.inviter!.email, name: invite.inviter!.firstName }],
          replyTo: { email: 'naoresponda@mailin.com', name: 'Não responda' }
        })

        if (!inviterIsTeamOwner) {
          const teamOwner = await db.user.findUnique({
            where: {
              id: invite.team?.ownerId,
            }
          })

          await brevo.sendTransacEmail({
            subject: '[mail.in] Aviso!',
            htmlContent: await render(NotifyAcceptedInviteToOwner({
              guestEmail: invite.guestEmail,
              inviterName: invite.inviter!.firstName,
            })),
            sender: { name: 'mail.in Admin', email: 'marcos.dev07@gmail.com' },
            to: [{ email: teamOwner!.email, name: teamOwner?.firstName }],
            replyTo: { email: 'naoresponda@mailin.com', name: 'Não responda' }
          })
        }

        return reply.status(201).send({ membershipId: membership.id })
      })
}