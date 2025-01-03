import { env } from "@/env";

export function generateInvitationUrl(slug: string): string {
  return new URL(`/team/${slug}/invite`, env.REDIRECT_URL).toString()
}