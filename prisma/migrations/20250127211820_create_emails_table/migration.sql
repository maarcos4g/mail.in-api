-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('DRAFT', 'QUEUE', 'SENT');

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "email_list" TEXT NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_email_list_fkey" FOREIGN KEY ("email_list") REFERENCES "email_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
