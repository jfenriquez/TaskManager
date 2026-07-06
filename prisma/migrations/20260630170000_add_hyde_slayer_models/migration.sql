-- CreateEnum
CREATE TYPE "BattleResult" AS ENUM ('VICTORY', 'DEFEAT', 'FLEE');
CREATE TYPE "PactStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "PactDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'IMPOSSIBLE');
CREATE TYPE "ItemRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'CONSUMABLE', 'KEY_ITEM', 'BOOST');
CREATE TYPE "AchievementCategory" AS ENUM ('COMBAT', 'GOALS', 'PACTS', 'VITAMENTES', 'STREAK', 'GENERAL');

-- CreateTable: player_profile (extends User with game stats)
CREATE TABLE "player_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "discipline" INTEGER NOT NULL DEFAULT 0,
    "playerName" TEXT NOT NULL DEFAULT 'Guerrero',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "player_profile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "player_profile_userId_key" ON "player_profile"("userId");
ALTER TABLE "player_profile" ADD CONSTRAINT "player_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: xp_log (earnings history)
CREATE TABLE "xp_log" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "xp_log_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "xp_log_playerId_createdAt_idx" ON "xp_log"("playerId", "createdAt");
ALTER TABLE "xp_log" ADD CONSTRAINT "xp_log_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: daily_log (per-day activity summary)
CREATE TABLE "daily_log" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "goalsProgress" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "battleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_log_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "daily_log_playerId_date_key" ON "daily_log"("playerId", "date");
ALTER TABLE "daily_log" ADD CONSTRAINT "daily_log_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: vitamente (affirmation templates)
CREATE TABLE "vitamente" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vitamente_pkey" PRIMARY KEY ("id")
);

-- CreateTable: vitamente_log (user affirmation completions)
CREATE TABLE "vitamente_log" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "vitamenteId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vitamente_log_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "vitamente_log_playerId_vitamenteId_completedAt_key" ON "vitamente_log"("playerId", "vitamenteId", "completedAt");
CREATE INDEX "vitamente_log_playerId_completedAt_idx" ON "vitamente_log"("playerId", "completedAt");
ALTER TABLE "vitamente_log" ADD CONSTRAINT "vitamente_log_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vitamente_log" ADD CONSTRAINT "vitamente_log_vitamenteId_fkey" FOREIGN KEY ("vitamenteId") REFERENCES "vitamente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: relaxation_exercise (exercise templates)
CREATE TABLE "relaxation_exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "relaxation_exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable: relaxation_log (user exercise completions)
CREATE TABLE "relaxation_log" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "relaxation_log_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "relaxation_log_playerId_completedAt_idx" ON "relaxation_log"("playerId", "completedAt");
ALTER TABLE "relaxation_log" ADD CONSTRAINT "relaxation_log_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "relaxation_log" ADD CONSTRAINT "relaxation_log_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "relaxation_exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: hyde_enemy (Hyde forms / enemies)
CREATE TABLE "hyde_enemy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "hp" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "coinReward" INTEGER NOT NULL DEFAULT 10,
    "imageUrl" TEXT,
    "isBoss" BOOLEAN NOT NULL DEFAULT false,
    "castleLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hyde_enemy_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "hyde_enemy_castleLevel_idx" ON "hyde_enemy"("castleLevel");

-- CreateTable: castle_level (boss progression levels)
CREATE TABLE "castle_level" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bossId" TEXT,
    "xpRequired" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "castle_level_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "castle_level_level_key" ON "castle_level"("level");
CREATE UNIQUE INDEX "castle_level_bossId_key" ON "castle_level"("bossId");
ALTER TABLE "castle_level" ADD CONSTRAINT "castle_level_bossId_fkey" FOREIGN KEY ("bossId") REFERENCES "hyde_enemy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: castle_progress (per-player castle level progress)
CREATE TABLE "castle_progress" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "castleLevelId" TEXT NOT NULL,
    "defeated" BOOLEAN NOT NULL DEFAULT false,
    "bestTime" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "firstDefeatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "castle_progress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "castle_progress_playerId_castleLevelId_key" ON "castle_progress"("playerId", "castleLevelId");
ALTER TABLE "castle_progress" ADD CONSTRAINT "castle_progress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "castle_progress" ADD CONSTRAINT "castle_progress_castleLevelId_fkey" FOREIGN KEY ("castleLevelId") REFERENCES "castle_level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: battle_log (encounter history)
CREATE TABLE "battle_log" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "enemyId" TEXT NOT NULL,
    "result" "BattleResult" NOT NULL,
    "damageDealt" INTEGER NOT NULL DEFAULT 0,
    "damageTaken" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "coinsEarned" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "battle_log_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "battle_log_playerId_createdAt_idx" ON "battle_log"("playerId", "createdAt");
ALTER TABLE "battle_log" ADD CONSTRAINT "battle_log_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "battle_log" ADD CONSTRAINT "battle_log_enemyId_fkey" FOREIGN KEY ("enemyId") REFERENCES "hyde_enemy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: item (item catalog)
CREATE TABLE "item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ItemType" NOT NULL,
    "rarity" "ItemRarity" NOT NULL DEFAULT 'COMMON',
    "effect" JSONB,
    "iconUrl" TEXT,
    "buyPrice" INTEGER,
    "sellPrice" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "item_type_rarity_idx" ON "item"("type", "rarity");

-- CreateTable: inventory (player item holdings)
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "inventory_playerId_itemId_key" ON "inventory"("playerId", "itemId");
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: pact (challenge/contract definitions)
CREATE TABLE "pact" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "difficulty" "PactDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "xpReward" INTEGER NOT NULL,
    "coinReward" INTEGER NOT NULL,
    "disciplineReward" INTEGER NOT NULL DEFAULT 0,
    "requirements" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pact_pkey" PRIMARY KEY ("id")
);

-- CreateTable: player_pact (user pact subscriptions)
CREATE TABLE "player_pact" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "pactId" TEXT NOT NULL,
    "status" "PactStatus" NOT NULL DEFAULT 'ACTIVE',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    CONSTRAINT "player_pact_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "player_pact_playerId_pactId_key" ON "player_pact"("playerId", "pactId");
ALTER TABLE "player_pact" ADD CONSTRAINT "player_pact_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "player_pact" ADD CONSTRAINT "player_pact_pactId_fkey" FOREIGN KEY ("pactId") REFERENCES "pact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: achievement (achievement definitions)
CREATE TABLE "achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "category" "AchievementCategory" NOT NULL,
    "condition" JSONB,
    "xpReward" INTEGER NOT NULL DEFAULT 100,
    "coinReward" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable: player_achievement (user achievement unlocks)
CREATE TABLE "player_achievement" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "player_achievement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "player_achievement_playerId_achievementId_key" ON "player_achievement"("playerId", "achievementId");
ALTER TABLE "player_achievement" ADD CONSTRAINT "player_achievement_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "player_achievement" ADD CONSTRAINT "player_achievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
