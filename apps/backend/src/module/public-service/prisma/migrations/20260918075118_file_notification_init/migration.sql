/*
  Warnings:

  - Added the required column `updatedAt` to the `stored_file_meta` table without a default value. This is not possible if the table is not empty.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "notification";

-- DropIndex
DROP INDEX "file"."stored_file_meta_bucketId_idx";

-- AlterTable
ALTER TABLE "file"."stored_file_meta" ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "etag" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "relationId" TEXT,
ADD COLUMN     "relationType" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "bytes" SET DATA TYPE BIGINT;

-- CreateTable
CREATE TABLE "notification"."email_notification_log" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorEmail" TEXT,
    "recipient" TEXT NOT NULL,
    "template" TEXT,
    "provider" TEXT NOT NULL,
    "subject" TEXT,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_notification_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification"."in_app_notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "linkPath" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorLabel" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "in_app_notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "in_app_notification_userId_createdAt_idx" ON "notification"."in_app_notification"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "in_app_notification_userId_readAt_idx" ON "notification"."in_app_notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "stored_file_meta_relationType_relationId_idx" ON "file"."stored_file_meta"("relationType", "relationId");
