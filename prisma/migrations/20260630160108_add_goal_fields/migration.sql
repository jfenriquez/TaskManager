-- DropIndex
DROP INDEX "goal_userId_month_key";

-- AlterTable
ALTER TABLE "goal" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "hydeAnswers" JSONB,
ADD COLUMN     "missions" JSONB,
ADD COLUMN     "priority" "PriorityEnum" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "purpose" TEXT,
ADD COLUMN     "timeline" TIMESTAMP(3),
ADD COLUMN     "visualization" TEXT,
ALTER COLUMN "month" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "goal" ADD CONSTRAINT "goal_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
