/*
  Warnings:

  - The `priority` column on the `Tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PriorityEnum" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Tasks" DROP COLUMN "priority",
ADD COLUMN     "priority" "PriorityEnum" NOT NULL DEFAULT 'MEDIUM';

-- DropEnum
DROP TYPE "public"."Priority";
