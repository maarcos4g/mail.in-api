import fastify from "fastify";
import cors from '@fastify/cors'

const app = fastify()

app.register(cors, {
  origin: [
    'http://localhost:5173',
    'http:/localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
})

app.listen({
  port: 3333,
  host: '0.0.0.0'
})
.then(() => console.log('🔥 HTTP Server Running...'))
.catch((error) => console.error(error))