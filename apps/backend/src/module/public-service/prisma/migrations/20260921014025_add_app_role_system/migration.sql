/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "auth"."users" DROP COLUMN "role";

-- DropEnum
DROP TYPE "auth"."UserRole";

-- CreateTable
CREATE TABLE "auth"."apps" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."roles" (
    "id" UUID NOT NULL,
    "appId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."user_roles" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "apps_name_key" ON "auth"."apps"("name");

-- CreateIndex
CREATE INDEX "roles_appId_idx" ON "auth"."roles"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_appId_name_key" ON "auth"."roles"("appId", "name");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "auth"."user_roles"("roleId");

-- AddForeignKey
ALTER TABLE "auth"."roles" ADD CONSTRAINT "roles_appId_fkey" FOREIGN KEY ("appId") REFERENCES "auth"."apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "auth"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
