/*
  Warnings:

  - You are about to drop the column `key` on the `jwks` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `jwks` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."jwks_key_key";

-- AlterTable
ALTER TABLE "jwks" DROP COLUMN "key",
DROP COLUMN "updatedAt",
ALTER COLUMN "createdAt" DROP DEFAULT;
