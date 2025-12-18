-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "ExecutionDate" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0;
