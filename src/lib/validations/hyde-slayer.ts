import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const BattleResultEnum = z.enum(["VICTORY", "DEFEAT", "FLEE"]);
export const PactStatusEnum = z.enum(["ACTIVE", "COMPLETED", "FAILED", "CANCELLED"]);
export const PactDifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD", "IMPOSSIBLE"]);
export const ItemRarityEnum = z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]);
export const ItemTypeEnum = z.enum(["WEAPON", "ARMOR", "CONSUMABLE", "KEY_ITEM", "BOOST"]);
export const AchievementCategoryEnum = z.enum(["COMBAT", "GOALS", "PACTS", "VITAMENTES", "STREAK", "GENERAL"]);

// ═══════════════════════════════════════════════════════════════
// COMMON
// ═══════════════════════════════════════════════════════════════

const id = z.string().min(1, "ID requerido");
const nonEmpty = z.string().min(1, "Este campo es requerido").trim();
const optionalDescription = z.string().max(2000).nullish();
const dateString = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/));

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ═══════════════════════════════════════════════════════════════
// PLAYER PROFILE
// ═══════════════════════════════════════════════════════════════

export const updatePlayerProfileSchema = z.object({
  playerName: z.string().min(2).max(50).trim().optional(),
});

export type UpdatePlayerProfileInput = z.infer<typeof updatePlayerProfileSchema>;

// ═══════════════════════════════════════════════════════════════
// VITAMENTES (Affirmations)
// ═══════════════════════════════════════════════════════════════

export const createVitamenteSchema = z.object({
  title: nonEmpty.max(100, "Máximo 100 caracteres"),
  content: nonEmpty.max(1000, "Máximo 1000 caracteres"),
  category: z.string().max(50).nullish(),
});

export const updateVitamenteSchema = createVitamenteSchema.partial().extend({ id });

export const completeVitamenteSchema = z.object({
  vitamenteId: id,
});

export type CreateVitamenteInput = z.infer<typeof createVitamenteSchema>;
export type UpdateVitamenteInput = z.infer<typeof updateVitamenteSchema>;
export type CompleteVitamenteInput = z.infer<typeof completeVitamenteSchema>;

// ═══════════════════════════════════════════════════════════════
// RELAXATION EXERCISES
// ═══════════════════════════════════════════════════════════════

export const createRelaxationExerciseSchema = z.object({
  name: nonEmpty.max(100),
  description: z.string().max(1000).nullish(),
  duration: z.number().int().positive("La duración debe ser positiva"),
  type: nonEmpty.max(50),
});

export const updateRelaxationExerciseSchema = createRelaxationExerciseSchema.partial().extend({ id });

export const completeRelaxationLogSchema = z.object({
  exerciseId: id,
  duration: z.number().int().positive(),
});

export type CreateRelaxationExerciseInput = z.infer<typeof createRelaxationExerciseSchema>;
export type UpdateRelaxationExerciseInput = z.infer<typeof updateRelaxationExerciseSchema>;
export type CompleteRelaxationLogInput = z.infer<typeof completeRelaxationLogSchema>;

// ═══════════════════════════════════════════════════════════════
// ENEMIES & BATTLE SYSTEM
// ═══════════════════════════════════════════════════════════════

export const createHydeEnemySchema = z.object({
  name: nonEmpty.max(100),
  description: z.string().max(1000).nullish(),
  level: z.number().int().positive().default(1),
  hp: z.number().int().positive(),
  attack: z.number().int().nonnegative(),
  defense: z.number().int().nonnegative(),
  xpReward: z.number().int().positive().default(50),
  coinReward: z.number().int().positive().default(10),
  imageUrl: z.string().url().nullish(),
  isBoss: z.boolean().default(false),
  castleLevel: z.number().int().positive().nullish(),
});

export const updateHydeEnemySchema = createHydeEnemySchema.partial().extend({ id });

/**
 * Simulates a battle between player and enemy.
 * Las stats de ataque/defensa se calculan en el servidor (nivel + items
 * equipados); el cliente solo indica el enemigo.
 */
export const simulateBattleSchema = z.object({
  enemyId: id,
});

export type CreateHydeEnemyInput = z.infer<typeof createHydeEnemySchema>;
export type UpdateHydeEnemyInput = z.infer<typeof updateHydeEnemySchema>;
export type SimulateBattleInput = z.infer<typeof simulateBattleSchema>;

export interface BattleResult {
  result: "VICTORY" | "DEFEAT";
  damageDealt: number;
  damageTaken: number;
  xpEarned: number;
  coinsEarned: number;
  turns: number;
  log: string[];
}

// ═══════════════════════════════════════════════════════════════
// CASTLE (Boss Progression)
// ═══════════════════════════════════════════════════════════════

export const createCastleLevelSchema = z.object({
  level: z.number().int().positive(),
  name: nonEmpty.max(100),
  description: z.string().max(1000).nullish(),
  bossId: id.nullish(),
  xpRequired: z.number().int().nonnegative().default(0),
});

export const updateCastleLevelSchema = createCastleLevelSchema.partial().extend({ id });

export const updateCastleProgressSchema = z.object({
  castleLevelId: id,
  defeated: z.boolean().optional(),
  bestTime: z.number().int().positive().nullish(),
  attempts: z.number().int().positive().optional(),
});

export type CreateCastleLevelInput = z.infer<typeof createCastleLevelSchema>;
export type UpdateCastleLevelInput = z.infer<typeof updateCastleLevelSchema>;
export type UpdateCastleProgressInput = z.infer<typeof updateCastleProgressSchema>;

// ═══════════════════════════════════════════════════════════════
// ITEMS & INVENTORY
// ═══════════════════════════════════════════════════════════════

export const createItemSchema = z.object({
  name: nonEmpty.max(100),
  description: z.string().max(1000).nullish(),
  type: ItemTypeEnum,
  rarity: ItemRarityEnum.default("COMMON"),
  effect: z.record(z.string(), z.unknown()).nullish(),
  iconUrl: z.string().url().nullish(),
  buyPrice: z.number().int().positive().nullish(),
  sellPrice: z.number().int().positive().nullish(),
});

export const updateItemSchema = createItemSchema.partial().extend({ id });

export const addToInventorySchema = z.object({
  itemId: id,
  quantity: z.number().int().positive().default(1),
});

export const updateInventorySchema = z.object({
  id,
  quantity: z.number().int().positive().optional(),
  equipped: z.boolean().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type AddToInventoryInput = z.infer<typeof addToInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

// ═══════════════════════════════════════════════════════════════
// PACTS (Contracts/Challenges)
// ═══════════════════════════════════════════════════════════════

export const createPactSchema = z.object({
  title: nonEmpty.max(100),
  description: z.string().max(2000).nullish(),
  duration: z.number().int().positive("Debe ser al menos 1 día"),
  difficulty: PactDifficultyEnum.default("MEDIUM"),
  xpReward: z.number().int().positive(),
  coinReward: z.number().int().positive(),
  disciplineReward: z.number().int().nonnegative().default(0),
  requirements: z.record(z.string(), z.unknown()).nullish(),
});

export const updatePactSchema = createPactSchema.partial().extend({ id });

export const acceptPactSchema = z.object({
  pactId: id,
});

export const updatePactProgressSchema = z.object({
  pactId: id,
  // Cuánto se avanzó en esta llamada (delta). El servidor nunca acepta fijar
  // el progreso absoluto: máximo +5 por llamada para evitar completar pactos
  // de alto valor en una sola request.
  progress: z.number().int().min(1).max(5, "Máximo +5% de avance por actualización"),
});

export const deletePactSchema = z.object({
  pactId: id,
});

export const completePactSchema = z.object({
  pactId: id,
});

export const claimRewardSchema = z.object({
  pactId: id,
});

export type CreatePactInput = z.infer<typeof createPactSchema>;
export type UpdatePactInput = z.infer<typeof updatePactSchema>;
export type AcceptPactInput = z.infer<typeof acceptPactSchema>;
export type UpdatePactProgressInput = z.infer<typeof updatePactProgressSchema>;
export type DeletePactInput = z.infer<typeof deletePactSchema>;
export type CompletePactInput = z.infer<typeof completePactSchema>;
export type ClaimRewardInput = z.infer<typeof claimRewardSchema>;

// ═══════════════════════════════════════════════════════════════
// ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════

export const createAchievementSchema = z.object({
  name: nonEmpty.max(100),
  description: z.string().max(1000).nullish(),
  iconUrl: z.string().url().nullish(),
  category: AchievementCategoryEnum,
  condition: z.record(z.string(), z.unknown()).nullish(),
  xpReward: z.number().int().positive().default(100),
  coinReward: z.number().int().positive().default(50),
});

export const updateAchievementSchema = createAchievementSchema.partial().extend({ id });

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;
