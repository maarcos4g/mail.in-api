import '../config/sentry' //import sentry configs

import fastify from "fastify";
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import * as sentry from '@sentry/node'
import { errorHandler } from '@/error-handler';

import { env } from '@/env';

import { getAllPlans } from './routes/get-all-plans';
import { createUser } from './routes/create-user';
import { sendAuthCode } from './routes/send-authentication-code';
import { validateCode } from './routes/validate-code';
import { createTeam } from './routes/create-team';
import { getProfile } from './routes/get-profile';
import { createEmailList } from './routes/create-email-list';
import { updateEmailList } from './routes/update-email-list';
import { deleteEmailList } from './routes/delete-email-list';
import { updateTeam } from './routes/update-team';
import { deleteTeam } from './routes/delete-team';
import { createInvite } from './routes/create-invite';
import { getTeamForSlug } from './routes/get-team-for-slug';
import { acceptInvite } from './routes/accept-invite';
import { getAllEmailList } from './routes/get-all-email-lists';
import { getInvitesForTeam } from './routes/get-invites-for-team';
import { signInWithEmail } from './routes/sign-in-with-email';
import { getAllMyInvitations } from './routes/get-all-my-invitations';
import { revokeInvite } from './routes/revoke-invite';
import { getTeamActivity } from './routes/get-team-activity';
import { getEmailList } from './routes/get-email-list';

const app = fastify()

app.register(cors, {
  origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
})
app.register(jwt, {
  secret: env.JWT_SECRET,
})

app.register(getAllPlans)
app.register(createUser)
app.register(sendAuthCode)
app.register(validateCode)
app.register(createTeam)
app.register(getProfile)
app.register(createEmailList)
app.register(updateEmailList)
app.register(deleteEmailList)
app.register(updateTeam)
app.register(deleteTeam)
app.register(createInvite)
app.register(getTeamForSlug)
app.register(acceptInvite)
app.register(getAllEmailList)
app.register(getInvitesForTeam)
app.register(signInWithEmail)
app.register(getAllMyInvitations)
app.register(revokeInvite)
app.register(getTeamActivity)
app.register(getEmailList)

sentry.setupFastifyErrorHandler(app)

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.listen({
  port: 3333,
  host: '0.0.0.0'
})
.then(() => console.log('🔥 HTTP Server Running...'))
.catch(error => {
  throw new Error('Error to init app', error)
})