import { db } from "./connection"
import { faker } from '@faker-js/faker'

async function seed() {
  await db.user.deleteMany()
  await db.team.deleteMany()
  await db.teamMembership.deleteMany()
  await db.plan.deleteMany()
  await db.authCode.deleteMany()

  const plan = await db.plan.create({
    data: {
      name: faker.lorem.word(2),
      description: faker.lorem.word(12),
      priceInCents: 0,
      updatedAt: new Date(),
    }
  })

  const user = await db.user.create({
    data: {
      fullName: 'Jhon Doe',
      firstName: 'Jhon',
      email: 'jhondoe@mail.com',
      avatarUrl: 'https://github.com/maarcos4g.png',
      isConfirmed: true,
      planId: plan.id,
    },

  })

  const anotherUser = await db.user.create({
    data: {
      fullName: faker.person.fullName(),
      firstName: faker.person.firstName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      isConfirmed: false,
      planId: plan.id,
    },
  })

  const anotherUser2 = await db.user.create({
    data: {
      fullName: faker.person.fullName(),
      firstName: faker.person.firstName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarGitHub(),
      isConfirmed: true,
      planId: plan.id,
    },
  })

  const team = await db.team.create({
    data: {
      name: faker.lorem.word(2),
      slug: faker.lorem.slug(2),
      ownerId: user.id,
      teamMembership: {
        createMany: {
          data: [
            {
              userId: user.id,
            },
            {
              userId: anotherUser.id,
            }
          ]
        }
      }
    }
  })

  const team2 = await db.team.create({
    data: {
      name: faker.lorem.word(4),
      slug: faker.lorem.slug(4),
      ownerId: anotherUser2.id,
      teamMembership: {
        create: {
          userId: anotherUser2.id,
        }
      }
    }
  })

}

seed().then(() => {
  console.log('Database seeded!')
})