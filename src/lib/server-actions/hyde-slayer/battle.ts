"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createHydeEnemySchema,
  updateHydeEnemySchema,
  simulateBattleSchema,
} from "@/src/lib/validations/hyde-slayer";
import {
  requirePlayerProfile,
  requireAdmin,
  ok,
  fail,
  handleActionError,
  awardXp,
  awardCoins,
  type ActionResult,
} from "./utils";

export async function getEnemies(): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      description: string | null;
      level: number;
      hp: number;
      attack: number;
      defense: number;
      xpReward: number;
      coinReward: number;
      isBoss: boolean;
      castleLevel: number | null;
    }>
  >
> {
  try {
    const enemies = await prisma.hydeEnemy.findMany({
      orderBy: [{ castleLevel: "asc" }, { level: "asc" }],
    });
    return ok(enemies);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getEnemyById(id: string): Promise<
  ActionResult<{
    id: string;
    name: string;
    description: string | null;
    level: number;
    hp: number;
    attack: number;
    defense: number;
    xpReward: number;
    coinReward: number;
    isBoss: boolean;
    castleLevel: number | null;
  }>
> {
  try {
    const enemy = await prisma.hydeEnemy.findUnique({ where: { id } });
    if (!enemy) return fail("Enemigo no encontrado");
    return ok(enemy);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function createEnemy(input: unknown): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    await requireAdmin();
    const data = createHydeEnemySchema.parse(input);
    const enemy = await prisma.hydeEnemy.create({ data });
    revalidatePath("/hyde-slayer");
    return ok({ id: enemy.id, name: enemy.name });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function updateEnemy(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const data = updateHydeEnemySchema.parse(input);
    await prisma.hydeEnemy.update({ where: { id: data.id }, data });
    revalidatePath("/hyde-slayer");
    return ok({ id: data.id });
  } catch (err) {
    return handleActionError(err);
  }
}

async function getPlayerBattleStats(playerId: string): Promise<{ attack: number; defense: number }> {
  const profile = await prisma.playerProfile.findUnique({
    where: { id: playerId },
    select: { level: true },
  });
  const level = profile?.level ?? 1;

  let attack = 10 + level * 3;
  let defense = 5 + level * 2;

  const equipped = await prisma.inventory.findMany({
    where: { playerId, equipped: true },
    include: { item: { select: { effect: true } } },
  });
  for (const inv of equipped) {
    const effect = inv.item.effect as Record<string, unknown> | null;
    if (typeof effect?.attack === "number") attack += effect.attack;
    if (typeof effect?.defense === "number") defense += effect.defense;
  }

  return { attack, defense };
}

export async function simulateBattle(input: unknown): Promise<
  ActionResult<{
    result: "VICTORY" | "DEFEAT";
    damageDealt: number;
    damageTaken: number;
    xpEarned: number;
    coinsEarned: number;
    turns: number;
    log: string[];
  }>
> {
  try {
    const { playerId } = await requirePlayerProfile();
    const data = simulateBattleSchema.parse(input);

    const enemy = await prisma.hydeEnemy.findUnique({ where: { id: data.enemyId } });
    if (!enemy) return fail("Enemigo no encontrado");

    // Stats autoritativas calculadas en el servidor (nivel + items equipados).
    // Nunca se confía en valores de ataque/defensa enviados por el cliente.
    const { attack: playerAttack, defense: playerDefense } = await getPlayerBattleStats(playerId);

    const log: string[] = [];
    let playerHp = 100 + playerDefense * 2;
    let enemyHp = enemy.hp;
    let turns = 0;
    let damageDealt = 0;
    let damageTaken = 0;
    const MAX_TURNS = 1000;

    while (playerHp > 0 && enemyHp > 0 && turns < MAX_TURNS) {
      turns++;
      const playerDmg = Math.max(1, playerAttack - enemy.defense + Math.floor(Math.random() * 5));
      enemyHp -= playerDmg;
      damageDealt += playerDmg;
      log.push(`Turno ${turns}: Atacas por ${playerDmg} (enemigo: ${Math.max(0, enemyHp)} HP)`);

      if (enemyHp <= 0) break;

      const enemyDmg = Math.max(1, enemy.attack - playerDefense + Math.floor(Math.random() * 3));
      playerHp -= enemyDmg;
      damageTaken += enemyDmg;
      log.push(`Turno ${turns}: Hyde ataca por ${enemyDmg} (tú: ${Math.max(0, playerHp)} HP)`);
    }

    const isVictory = playerHp > 0;

    // Anti-farmeo: solo las primeras 20 batallas del día otorgan recompensa.
    // El resto se registran (progreso de jefes/logros) sin XP ni monedas.
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const dailyLog = await prisma.dailyLog.upsert({
      where: { playerId_date: { playerId, date: todayStart } },
      create: { playerId, date: todayStart, battleCount: 0 },
      update: {},
    });
    const MAX_DAILY_REWARDED_BATTLES = 20;
    const rewarded = isVictory && dailyLog.battleCount < MAX_DAILY_REWARDED_BATTLES;
    const xpEarned = rewarded ? enemy.xpReward : 0;
    const coinsEarned = rewarded ? enemy.coinReward : 0;

    const battle = await prisma.battleLog.create({
      data: {
        playerId,
        enemyId: data.enemyId,
        result: isVictory ? "VICTORY" : "DEFEAT",
        damageDealt,
        damageTaken,
        xpEarned,
        coinsEarned,
        duration: turns * 3,
      },
    });

    if (isVictory) {
      await prisma.dailyLog.update({
        where: { playerId_date: { playerId, date: todayStart } },
        data: { battleCount: { increment: 1 } },
      });
    }

    if (rewarded) {
      await awardXp(playerId, enemy.xpReward, "battle", `Derrotaste a ${enemy.name}`);
      await awardCoins(playerId, enemy.coinReward);
      await prisma.dailyLog.update({
        where: { playerId_date: { playerId, date: todayStart } },
        data: { xpEarned: { increment: enemy.xpReward } },
      });
    }

    revalidatePath("/hyde-slayer");
    return ok({
      result: isVictory ? "VICTORY" : "DEFEAT",
      damageDealt: battle.damageDealt,
      damageTaken: battle.damageTaken,
      xpEarned: battle.xpEarned,
      coinsEarned: battle.coinsEarned,
      turns,
      log,
    });
  } catch (err) {
    return handleActionError(err);
  }
}

export async function getBattleHistory(limit = 20): Promise<
  ActionResult<
    Array<{
      id: string;
      result: string;
      xpEarned: number;
      coinsEarned: number;
      createdAt: Date;
      enemy: { name: string; level: number };
    }>
  >
> {
  try {
    const { playerId } = await requirePlayerProfile();
    // Tope superior para evitar queries pesadas con valores arbitrarios.
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const logs = await prisma.battleLog.findMany({
      where: { playerId },
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      include: { enemy: { select: { name: true, level: true } } },
    });
    return ok(logs);
  } catch (err) {
    return handleActionError(err);
  }
}
