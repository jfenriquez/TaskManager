-- AlterTable
ALTER TABLE "daily_log" ALTER COLUMN "date" DROP DEFAULT;

-- CreateTable
CREATE TABLE "api_key" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "api_key_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "api_key_userId_idx" ON "api_key"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_keyPrefix_userId_key" ON "api_key"("keyPrefix", "userId");

-- CreateIndex
CREATE INDEX "Tasks_userId_ExecutionDate_idx" ON "Tasks"("userId", "ExecutionDate");

-- CreateIndex
CREATE INDEX "Tasks_userId_completed_idx" ON "Tasks"("userId", "completed");

-- CreateIndex
CREATE INDEX "Tasks_userId_priority_idx" ON "Tasks"("userId", "priority");

-- CreateIndex
CREATE INDEX "category_userId_idx" ON "category"("userId");

-- CreateIndex
CREATE INDEX "daily_log_playerId_date_idx" ON "daily_log"("playerId", "date");

-- CreateIndex
CREATE INDEX "goal_userId_month_idx" ON "goal"("userId", "month");

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
