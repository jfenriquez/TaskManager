-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "timerEndsAt" TIMESTAMP(3),
ADD COLUMN     "timerMinutes" INTEGER,
ADD COLUMN     "timerStartedAt" TIMESTAMP(3);
