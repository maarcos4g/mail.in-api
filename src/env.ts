import { z } from 'zod'

const envSchema = z.object({
  SENTRY_DSN: z.string(),
})

export const env = envSchema.parse(process.env)