/*
  Warnings:

  - Added the required column `name` to the `email_list` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_list" ADD COLUMN     "name" TEXT NOT NULL;
