-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('MEMBERSHIP', 'CREATE');

-- CreateEnum
CREATE TYPE "ActivitySubtype" AS ENUM ('EMAILLIST', 'EMAIL');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "subtype" "ActivitySubtype" NOT NULL,
    "team_id" TEXT NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
