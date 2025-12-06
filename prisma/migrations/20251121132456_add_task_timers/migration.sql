-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "timerRemainingSeconds" INTEGER,
ADD COLUMN     "timerRunning" BOOLEAN NOT NULL DEFAULT false;
