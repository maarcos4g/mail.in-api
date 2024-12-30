/*
  Warnings:

  - A unique constraint covering the columns `[updated_at]` on the table `plans` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "planId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "plans_updated_at_key" ON "plans"("updated_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
