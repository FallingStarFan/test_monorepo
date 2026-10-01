/*
  Warnings:

  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "auth"."role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropTable
DROP TABLE "auth"."permissions";
