import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import { z } from "zod";
import { getUserPermissions } from "@/permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { db } from "@/db/connection";
import { ClientError } from "../_errors/client-error";

export async function getAllEmailList(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/email-list/:teamId',
      {
        schema: {
          params: z.object({
            teamId: z.string().uuid(),
          }),
          querystring: z.object({
            pageIndex: z.string().nullish().default('0').transform(Number),
            search: z.string().nullish(),
          }),
          response: {
            200: z.object({
              total: z.number(),
              emailLists: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  senders: z.string().array(),
                  ownerId: z.string().uuid(),
                  team: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    ownerId: z.string().uuid(),
                    slug: z.string(),
                  }),
                  createdAt: z.date(),
                  updatedAt: z.date().nullable(),
                  owner: z.object({
                    firstName: z.string(),
                    avatarUrl: z.string().url().nullable(),
                  }).nullable()
                })
              )
            })
          }
        }
      },
      async (request, reply) => {
        const { teamId } = request.params
        const userId = await request.getCurrentUserId()
        const { pageIndex, search: searchQuery } = request.query

        const { cannot } = await getUserPermissions(userId)

        if (await cannot('read', 'Team', teamId)) {
          throw new UnauthorizedError(`You're not allowed to read team data.`)
        }

        const team = await db.team.findUnique({
          where: { id: teamId }
        })

        if (!team) {
          throw new ClientError('Team not found')
        }

        const [emailLists, count] = await Promise.all([
          db.emailList.findMany({
            where: !searchQuery ? {
              teamId,
            } : {
              teamId,
              name: {
                contains: searchQuery,
              }
            },
            include: {
              team: true,
            },
            take: 6,
            skip: pageIndex * 6,
            orderBy: {
              createdAt: 'desc',
            },
          }),

          db.emailList.count({
            where: !searchQuery
              ? { teamId }
              : {
                  teamId,
                  name: {
                    contains: searchQuery,
                  },
                },
          })
        ])

        const emailListsWithOwners = await Promise.all(
          emailLists.map(async (emailList) => {
            const owner = await db.user.findUnique({
              where: { id: emailList.ownerId },
              select: {
                firstName: true,
                avatarUrl: true,
              },
            });

            return {
              ...emailList,
              owner, // Adiciona o objeto owner aos resultados
            };
          })
        );

        return reply.status(200).send({ total: count, emailLists: emailListsWithOwners })
      }
    )
}