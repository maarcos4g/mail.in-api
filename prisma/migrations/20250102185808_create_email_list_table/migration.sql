/*
  Warnings:

  - You are about to drop the column `ownerId` on the `teams` table. All the data in the column will be lost.
  - Added the required column `owner_id` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "ownerId",
ADD COLUMN     "owner_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "email_list" (
    "id" TEXT NOT NULL,
    "senders" TEXT[],
    "owner_id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "email_list_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "email_list" ADD CONSTRAINT "email_list_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
