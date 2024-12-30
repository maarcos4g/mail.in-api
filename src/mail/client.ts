import { env } from "@/env"
import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from "@getbrevo/brevo"

export const brevo = (() => {
  const apiInstance = new TransactionalEmailsApi()
  apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY)
  return apiInstance
})()