/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `jwks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `privateKey` to the `jwks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicKey` to the `jwks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "jwks" ADD COLUMN     "privateKey" TEXT NOT NULL,
ADD COLUMN     "publicKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "jwks_key_key" ON "jwks"("key");
