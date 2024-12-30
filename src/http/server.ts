import '../config/sentry' //import sentry configs

import fastify from "fastify";
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import * as sentry from '@sentry/node'

import { env } from '@/env';

import { getAllPlans } from './routes/get-all-plans';
import { createUser } from './routes/create-user';
import { sendAuthCode } from './routes/send-authentication-code';

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

sentry.setupFastifyErrorHandler(app)

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.listen({
  port: 3333,
  host: '0.0.0.0'
})
.then(() => console.log('🔥 HTTP Server Running...'))
.catch(error => {
  throw new Error('Error to init app', error)
})