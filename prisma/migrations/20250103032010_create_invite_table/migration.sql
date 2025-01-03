-- AlterTable
ALTER TABLE "team_membership" ADD COLUMN     "hasInvite" BOOLEAN DEFAULT false,
ADD COLUMN     "invitationId" TEXT;

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "guest_id" TEXT,
    "guest_email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "team_id" TEXT,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
