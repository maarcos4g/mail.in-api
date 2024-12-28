import { env } from '@/env'
import * as sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

sentry.init({
  dsn: env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration()
  ],
  tracesSampleRate: 1.0,
});

sentry.profiler.startProfiler()

sentry.startSpan({
  name: 'My first transaction',
}, () => {

})

sentry.profiler.stopProfiler()