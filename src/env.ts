import { z } from 'zod'

const envSchema = z.object({
  SENTRY_DSN: z.string().url(),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  BREVO_API_KEY: z.string(),
})

export const env = envSchema.parse(process.env)