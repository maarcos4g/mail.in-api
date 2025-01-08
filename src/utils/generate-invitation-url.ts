import { env } from "@/env";

export function generateInvitationUrl(slug: string, inviteId: string): string {
  return new URL(`/team/${encodeURIComponent(slug)}/invite/${inviteId}`, env.REDIRECT_URL).toString()
}