-- CreateEnum
CREATE TYPE "public"."SongActivityType" AS ENUM ('played', 'skipped');

-- CreateTable
CREATE TABLE "public"."SongActivity" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "type" "public"."SongActivityType" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SongActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SongActivity_songId_idx" ON "public"."SongActivity"("songId");

-- CreateIndex
CREATE INDEX "SongActivity_songId_type_createdAt_idx" ON "public"."SongActivity"("songId", "type", "createdAt");

-- Backfill historical played activity from Song timestamps
INSERT INTO "public"."SongActivity" ("id", "songId", "type", "createdAt")
SELECT
  CONCAT('migration_played_', "id"),
  "id",
  'played'::"public"."SongActivityType",
  "lastPlayedAt"
FROM "public"."Song"
WHERE "lastPlayedAt" IS NOT NULL;

-- Backfill historical skipped activity from Song timestamps
INSERT INTO "public"."SongActivity" ("id", "songId", "type", "createdAt")
SELECT
  CONCAT('migration_skipped_', "id"),
  "id",
  'skipped'::"public"."SongActivityType",
  "lastSkippedAt"
FROM "public"."Song"
WHERE "lastSkippedAt" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."SongActivity" ADD CONSTRAINT "SongActivity_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "public"."Song"
DROP COLUMN "lastPlayedAt",
DROP COLUMN "lastSkippedAt";
