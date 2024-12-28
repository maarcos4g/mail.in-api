import '../config/sentry' //import sentry configs
import fastify from "fastify";
import cors from '@fastify/cors'

import * as sentry from '@sentry/node'

const app = fastify()

app.register(cors, {
  origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
})

sentry.setupFastifyErrorHandler(app)

app.get('/sentry', async () => {
  const vari = false

  if (!vari) {
    throw new Error('Debugging error in sentry!')
  }
  return "hello!"
})

app.listen({
  port: 3333,
  host: '0.0.0.0'
})
.then(() => console.log('🔥 HTTP Server Running...'))
.catch(error => {
  throw new Error('Error to init app', error)
})