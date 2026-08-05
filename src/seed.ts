import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function connectWithRetry(maxRetries = 10, delay = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      console.log("✅ Conectado a la base de datos");
      return;
    } catch {
      console.log(`⏳ Intento ${i + 1}/${maxRetries} — DB no disponible, esperando ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("No se pudo conectar a la base de datos después de varios intentos");
}

async function main() {
  console.log("🌱 Iniciando seed...");
  await connectWithRetry();

  // ── Seed user ──────────────────────────────────────────────
  // Credenciales desde env: evita dejar una cuenta conocida en producción.
  // Si el entorno es producción, aborta a menos que SEED_EMAIL se defina
  // explícitamente (y aun así la contraseña debe venir de SEED_PASSWORD).
  const isProduction = process.env.NODE_ENV === "production";
  const seedEmail = process.env.SEED_EMAIL;
  const seedPassword = process.env.SEED_PASSWORD;

  if (isProduction && !seedEmail) {
    throw new Error("No ejecutar el seed en producción sin SEED_EMAIL explícito");
  }
  if (seedEmail && !seedPassword) {
    throw new Error("SEED_PASSWORD es obligatorio cuando se define SEED_EMAIL");
  }

  const seedUserId = randomUUID();

  if (seedEmail) {
    const existingUser = await prisma.user.findUnique({ where: { email: seedEmail } });
    const actualUserId = existingUser?.id ?? seedUserId;

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: seedUserId,
          name: "Seed User",
          email: seedEmail,
          image: null,
          emailVerified: true,
          role: "USER",
        },
      });
    }

    const hashed = await hashPassword(seedPassword!);
    const existingAccount = await prisma.account.findFirst({
      where: { userId: actualUserId, providerId: "credential" },
    });
    if (!existingAccount) {
      await prisma.account.create({
        data: {
          id: randomUUID(),
          userId: actualUserId,
          accountId: seedEmail,
          providerId: "credential",
          password: hashed,
        },
      });
      console.log(`🔐 Cuenta credentials creada para ${seedEmail}`);
    }

    // ── Player Profile ─────────────────────────────────────────
    let playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: actualUserId },
    });
    if (!playerProfile) {
      playerProfile = await prisma.playerProfile.create({
        data: {
          userId: actualUserId,
          level: 1,
          xp: 0,
          coins: 100,
          discipline: 0,
          playerName: "Guerrero",
        },
      });
      console.log("🎮 Perfil de jugador creado");
    }

    // ── Categories ─────────────────────────────────────────────
    const catData = [
      { name: "Sueño", color: "#6366f1" },
      { name: "Trabajo", color: "#ef4444" },
      { name: "Estudio", color: "#10b981" },
      { name: "Ocio y entretenimiento", color: "#f59e0b" },
      { name: "Cuidado personal", color: "#ec4899" },
      { name: "Comidas y bebidas", color: "#f97316" },
      { name: "Tareas del hogar", color: "#14b8a6" },
      { name: "Desplazamientos", color: "#8b5cf6" },
    ];

    const categories = await Promise.all(
      catData.map((c) =>
        prisma.category.upsert({
          where: { id: `${actualUserId}_${c.name}` },
          update: {},
          create: { id: `${actualUserId}_${c.name}`, name: c.name, color: c.color, userId: actualUserId },
        })
      )
    );

    // ── Tasks ──────────────────────────────────────────────────
    await prisma.tasks.upsert({
      where: { id: `${actualUserId}_task_1` },
      update: {},
      create: {
        id: `${actualUserId}_task_1`,
        title: "Comprar alimentos",
        description: "Ir al supermercado y comprar frutas, verduras y leche",
        userId: actualUserId,
        categoryId: categories[5].id,
      },
    });
  }

  // ── Vitamentes (Affirmations) ──────────────────────────────
  const vitamentes = [
    { title: "Amanecer", content: "Hoy es un nuevo día lleno de oportunidades. Elijo ser mi mejor versión.", category: "mañana" },
    { title: "Fuerza interior", content: "Tengo el poder de superar cualquier desafío que se presente.", category: "motivacion" },
    { title: "Disciplina", content: "La disciplina es el puente entre mis metas y mis logros.", category: "motivacion" },
    { title: "Resiliencia", content: "Cada caída me enseña algo valioso. Me levanto más fuerte.", category: "motivacion" },
    { title: "Enfoque", content: "Mi mente está clara, mi corazón está enfocado, mi espíritu es indomable.", category: "tarde" },
    { title: "Gratitud", content: "Agradezco por todo lo que tengo y por todo lo que estoy por lograr.", category: "noche" },
    { title: "Valentía", content: "El miedo es temporal, el arrepentimiento es eterno. Actúo con valentía.", category: "motivacion" },
    { title: "Paz interior", content: "Respiro profundamente y encuentro calma dentro de mí.", category: "relajacion" },
    { title: "Propósito", content: "Cada acción que tomo me acerca a mi propósito más elevado.", category: "mañana" },
    { title: "Confianza", content: "Creo en mí mismo y en mi capacidad para lograr lo imposible.", category: "motivacion" },
  ];

  for (const v of vitamentes) {
    await prisma.vitamente.upsert({
      where: { id: `vit_${v.title.toLowerCase().replace(/\s+/g, "_")}` },
      update: {},
      create: {
        id: `vit_${v.title.toLowerCase().replace(/\s+/g, "_")}`,
        title: v.title,
        content: v.content,
        category: v.category,
      },
    });
  }
  console.log(`💪 ${vitamentes.length} vitamentes creados`);

  // ── Relaxation Exercises ───────────────────────────────────
  const exercises = [
    { name: "Respiración 4-7-8", description: "Inhala 4s, sostén 7s, exhala 8s", duration: 60, type: "breathing" },
    { name: "Respiración cuadrada", description: "Inhala 4s, sostén 4s, exhala 4s, espera 4s", duration: 60, type: "breathing" },
    { name: "Escaneo corporal", description: "Enfoca tu atención en cada parte del cuerpo", duration: 180, type: "meditation" },
    { name: "Visualización guiada", description: "Imagina un lugar seguro y tranquilo", duration: 300, type: "meditation" },
    { name: "Estiramientos de cuello", description: "Libera tensión acumulada en el cuello y hombros", duration: 120, type: "stretching" },
    { name: "Respiración diafragmática", description: "Respira profundamente usando el diafragma", duration: 90, type: "breathing" },
    { name: "Meditación de atención plena", description: "Observa tus pensamientos sin juzgar", duration: 600, type: "meditation" },
    { name: "Estiramiento de guerrero", description: "Postura de yoga para fortalecer cuerpo y mente", duration: 180, type: "stretching" },
  ];

  for (const ex of exercises) {
    await prisma.relaxationExercise.upsert({
      where: { id: `relax_${ex.name.toLowerCase().replace(/\s+/g, "_")}` },
      update: {},
      create: {
        id: `relax_${ex.name.toLowerCase().replace(/\s+/g, "_")}`,
        name: ex.name,
        description: ex.description,
        duration: ex.duration,
        type: ex.type,
      },
    });
  }
  console.log(`🧘 ${exercises.length} ejercicios de relajación creados`);

  // ── Hyde Enemies (Patrones de pensamiento negativo) ────────
  const enemies = [
    { name: "Cinismo", description: "Ten fe. Cuando Hyde te intente convencer de que es una pérdida de tiempo, responde: «Si ahora soy consciente de esta conversación, entonces mi sistema funciona»", level: 1, hp: 30, attack: 5, defense: 2, xpReward: 20, coinReward: 5, castleLevel: 1, isBoss: false },
    { name: "Negativismo", description: "Cuando sientas que Hyde desanima tu espíritu recordándote todo lo que está mal, recuerda: «Tú puedes elegir tu propia actitud. LA ELECCIÓN ES TUYA. CRÉELO»", level: 2, hp: 45, attack: 8, defense: 3, xpReward: 30, coinReward: 8, castleLevel: 1, isBoss: false },
    { name: "Derrotismo", description: "«Nada va a detenerme». No te lamentes de tus defectos, redobla tus esfuerzos.", level: 3, hp: 55, attack: 10, defense: 5, xpReward: 40, coinReward: 10, castleLevel: 1, isBoss: false },
    { name: "Evasión", description: "Cuando te encuentres intentando evitar la incomodidad, no dejes que Hyde te convierta en un asno. Enfrenta lo incómodo.", level: 4, hp: 70, attack: 12, defense: 7, xpReward: 50, coinReward: 12, castleLevel: 2, isBoss: false },
    { name: "Postergación", description: "ESTO SOLO TENDRÁ EFECTO CUANDO EL EJERCICIO SE REALICE. «Todos tenemos 24 horas». «¿Qué es lo peor que me puede pasar?»", level: 5, hp: 85, attack: 15, defense: 8, xpReward: 60, coinReward: 15, castleLevel: 2, isBoss: false },
    // ── Bosses ──
    { name: "Hyde del Miedo (Jefe del Nivel 1)", description: "El guardián de las dudas, maestro del castillo medio", level: 5, hp: 200, attack: 15, defense: 10, xpReward: 200, coinReward: 50, castleLevel: 1, isBoss: true },
    { name: "Hyde de la Pereza (Jefe del Nivel 2)", description: "El señor de la inercia que domina el castillo inferior", level: 10, hp: 350, attack: 25, defense: 18, xpReward: 350, coinReward: 100, castleLevel: 2, isBoss: true },
    { name: "Hyde Supremo (Jefe Final)", description: "La manifestación más poderosa de tu sombra interior", level: 15, hp: 500, attack: 35, defense: 25, xpReward: 1000, coinReward: 300, castleLevel: 3, isBoss: true },
  ];

  for (const e of enemies) {
    await prisma.hydeEnemy.upsert({
      where: { id: `enemy_${e.name.toLowerCase().replace(/\s+/g, "_")}` },
      update: {},
      create: {
        id: `enemy_${e.name.toLowerCase().replace(/\s+/g, "_")}`,
        name: e.name,
        description: e.description,
        level: e.level,
        hp: e.hp,
        attack: e.attack,
        defense: e.defense,
        xpReward: e.xpReward,
        coinReward: e.coinReward,
        isBoss: e.isBoss,
        castleLevel: e.castleLevel,
      },
    });
  }
  console.log(`👹 ${enemies.length} enemigos Hyde creados`);

  // ── Castle Levels ──────────────────────────────────────────
  const castleLevels = [
    { level: 1, name: "Sótano de la Pereza", description: "El nivel más profundo, donde habita la inercia y la procrastinación", xpRequired: 0 },
    { level: 2, name: "Salón del Miedo", description: "Donde tus inseguridades toman forma física", xpRequired: 200 },
    { level: 3, name: "Torre del Hyde Supremo", description: "La cima del castillo, el desafío final", xpRequired: 500 },
  ];

  for (const cl of castleLevels) {
    const bossEnemy = enemies.find((e) => e.isBoss && e.castleLevel === cl.level);
    const boss = bossEnemy
      ? await prisma.hydeEnemy.findUnique({
          where: { id: `enemy_${bossEnemy.name.toLowerCase().replace(/\s+/g, "_")}` },
        })
      : null;

    await prisma.castleLevel.upsert({
      where: { level: cl.level },
      update: {},
      create: {
        level: cl.level,
        name: cl.name,
        description: cl.description,
        xpRequired: cl.xpRequired,
        bossId: boss?.id ?? null,
      },
    });
  }
  console.log(`🏰 ${castleLevels.length} niveles de castillo creados`);

  // ── Items ──────────────────────────────────────────────────
  const items = [
    { name: "Espada de la Disciplina", description: "Aumenta tu ataque en batalla", type: "WEAPON" as const, rarity: "COMMON" as const, effect: { attackBoost: 5 }, buyPrice: 50, sellPrice: 10 },
    { name: "Escudo de la Resiliencia", description: "Reduce el daño recibido", type: "ARMOR" as const, rarity: "COMMON" as const, effect: { defenseBoost: 5 }, buyPrice: 50, sellPrice: 10 },
    { name: "Amuleto de la Constancia", description: "Aumenta la recompensa de XP", type: "BOOST" as const, rarity: "UNCOMMON" as const, effect: { xpMultiplier: 1.2 }, buyPrice: 100, sellPrice: 25 },
    { name: "Poción de Energía", description: "Recupera energía para seguir luchando", type: "CONSUMABLE" as const, rarity: "COMMON" as const, effect: { healAmount: 50 }, buyPrice: 20, sellPrice: 5 },
    { name: "Poción de Concentración", description: "Duplica la XP ganada por 30 minutos", type: "CONSUMABLE" as const, rarity: "RARE" as const, effect: { xpBoost: 2.0, durationMinutes: 30 }, buyPrice: 150, sellPrice: 40 },
    { name: "Armadura de la Fortaleza", description: "Gran protección contra los ataques de Hyde", type: "ARMOR" as const, rarity: "RARE" as const, effect: { defenseBoost: 15 }, buyPrice: 300, sellPrice: 75 },
    { name: "Espada legendaria del Alba", description: "El arma más poderosa contra la oscuridad interior", type: "WEAPON" as const, rarity: "EPIC" as const, effect: { attackBoost: 30 }, buyPrice: 500, sellPrice: 125 },
    { name: "Libro de la Sabiduría", description: "Revela secretos sobre los patrones de Hyde", type: "KEY_ITEM" as const, rarity: "UNCOMMON" as const, effect: { revealWeakness: true }, buyPrice: null, sellPrice: 50 },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { id: `item_${item.name.toLowerCase().replace(/\s+/g, "_")}` },
      update: {},
      create: {
        id: `item_${item.name.toLowerCase().replace(/\s+/g, "_")}`,
        name: item.name,
        description: item.description,
        type: item.type,
        rarity: item.rarity,
        effect: item.effect,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
      },
    });
  }
  console.log(`🎒 ${items.length} ítems creados`);

  // ── Pacts (Contracts) ──────────────────────────────────────
  const pacts = [
    { title: "Pacto del Amanecer", description: "Levantarte antes de las 6:30 AM por 7 días consecutivos", duration: 7, difficulty: "MEDIUM" as const, xpReward: 200, coinReward: 50, disciplineReward: 100 },
    { title: "Pacto del Lector", description: "Leer 30 minutos al día durante 30 días", duration: 30, difficulty: "HARD" as const, xpReward: 500, coinReward: 200, disciplineReward: 300 },
    { title: "Pacto del Guerrero Fitness", description: "Ejercitarte 5 veces por semana durante un mes", duration: 30, difficulty: "HARD" as const, xpReward: 600, coinReward: 150, disciplineReward: 400 },
    { title: "Pacto de la Mente Clara", description: "Meditar 10 minutos diarios por 14 días", duration: 14, difficulty: "MEDIUM" as const, xpReward: 300, coinReward: 80, disciplineReward: 150 },
    { title: "Pacto del Organizado", description: "Mantener tu espacio de trabajo ordenado por 7 días", duration: 7, difficulty: "EASY" as const, xpReward: 100, coinReward: 30, disciplineReward: 50 },
    { title: "Pacto de la Hidratación", description: "Beber 2 litros de agua al día por 21 días", duration: 21, difficulty: "MEDIUM" as const, xpReward: 250, coinReward: 60, disciplineReward: 100 },
    { title: "Pacto del Maestro del Tiempo", description: "Sin redes sociales por 7 días (solo trabajo y estudio)", duration: 7, difficulty: "IMPOSSIBLE" as const, xpReward: 1000, coinReward: 500, disciplineReward: 500 },
    { title: "Pacto del Escritor", description: "Escribir 500 palabras al día durante 14 días", duration: 14, difficulty: "MEDIUM" as const, xpReward: 300, coinReward: 100, disciplineReward: 200 },
    { title: "Pacto del Ahorrador", description: "Ahorrar el 10% de tus ingresos por 30 días", duration: 30, difficulty: "HARD" as const, xpReward: 400, coinReward: 250, disciplineReward: 250 },
    { title: "Pacto del Detox Digital", description: "Sin pantallas 1 hora antes de dormir por 14 días", duration: 14, difficulty: "MEDIUM" as const, xpReward: 350, coinReward: 100, disciplineReward: 200 },
  ];

  for (const pact of pacts) {
    await prisma.pact.upsert({
      where: { id: `pact_${pact.title.toLowerCase().replace(/\s+/g, "_")}` },
      update: {},
      create: {
        id: `pact_${pact.title.toLowerCase().replace(/\s+/g, "_")}`,
        title: pact.title,
        description: pact.description,
        duration: pact.duration,
        difficulty: pact.difficulty,
        xpReward: pact.xpReward,
        coinReward: pact.coinReward,
        disciplineReward: pact.disciplineReward,
        requirements: { minStreak: 0 },
      },
    });
  }
  console.log(`📜 ${pacts.length} pactos creados`);

  // ── Achievements ───────────────────────────────────────────
  const achievements = [
    { name: "Primer paso", description: "Completa tu primera tarea", category: "GOALS" as const, condition: { type: "tasks_completed", count: 1 }, xpReward: 50, coinReward: 10 },
    { name: "Racha inicial", description: "Mantén una racha de 3 días", category: "STREAK" as const, condition: { type: "streak", count: 3 }, xpReward: 100, coinReward: 25 },
    { name: "Matutino", description: "Completa una vitamente matutina", category: "VITAMENTES" as const, condition: { type: "vitamente_morning", count: 1 }, xpReward: 30, coinReward: 10 },
    { name: "Cazador de Hyde", description: "Derrota a tu primer enemigo Hyde", category: "COMBAT" as const, condition: { type: "battle_wins", count: 1 }, xpReward: 100, coinReward: 30 },
    { name: "Matamonstruos", description: "Derrota a 10 enemigos Hyde", category: "COMBAT" as const, condition: { type: "battle_wins", count: 10 }, xpReward: 300, coinReward: 100 },
    { name: "Leyenda viva", description: "Derrota a 50 enemigos Hyde", category: "COMBAT" as const, condition: { type: "battle_wins", count: 50 }, xpReward: 1000, coinReward: 500 },
    { name: "Racha de acero", description: "Mantén una racha de 7 días", category: "STREAK" as const, condition: { type: "streak", count: 7 }, xpReward: 300, coinReward: 100 },
    { name: "Racha implacable", description: "Mantén una racha de 30 días", category: "STREAK" as const, condition: { type: "streak", count: 30 }, xpReward: 1500, coinReward: 500 },
    { name: "Racha legendaria", description: "Mantén una racha de 100 días", category: "STREAK" as const, condition: { type: "streak", count: 100 }, xpReward: 5000, coinReward: 2000 },
    { name: "Maestro de la disciplina", description: "Acumula 1000 puntos de disciplina", category: "GENERAL" as const, condition: { type: "discipline", count: 1000 }, xpReward: 500, coinReward: 200 },
    { name: "Rico en experiencia", description: "Alcanza el nivel 10", category: "GENERAL" as const, condition: { type: "level", count: 10 }, xpReward: 500, coinReward: 150 },
    { name: "Coleccionista", description: "Consigue 5 ítems diferentes", category: "GENERAL" as const, condition: { type: "items", count: 5 }, xpReward: 200, coinReward: 100 },
    { name: "Pacificador", description: "Completa 10 ejercicios de relajación", category: "GENERAL" as const, condition: { type: "relaxation", count: 10 }, xpReward: 150, coinReward: 50 },
    { name: "Contratista", description: "Completa tu primer pacto", category: "PACTS" as const, condition: { type: "pacts_completed", count: 1 }, xpReward: 200, coinReward: 50 },
    { name: "Cumplidor", description: "Completa 5 pactos", category: "PACTS" as const, condition: { type: "pacts_completed", count: 5 }, xpReward: 500, coinReward: 200 },
    { name: "Conquistador del Sótano", description: "Derrota al Hyde de la Pereza (Jefe Nivel 1)", category: "COMBAT" as const, condition: { type: "boss_defeated", bossLevel: 1 }, xpReward: 300, coinReward: 100 },
    { name: "Conquistador del Salón", description: "Derrota al Hyde del Miedo (Jefe Nivel 2)", category: "COMBAT" as const, condition: { type: "boss_defeated", bossLevel: 2 }, xpReward: 500, coinReward: 200 },
    { name: "Conquistador de la Torre", description: "Derrota al Hyde Supremo (Jefe Final)", category: "COMBAT" as const, condition: { type: "boss_defeated", bossLevel: 3 }, xpReward: 1000, coinReward: 500 },
    { name: "Señor del Castillo", description: "Completa los 3 niveles del Castillo de Hyde", category: "COMBAT" as const, condition: { type: "all_castle_cleared" }, xpReward: 2000, coinReward: 1000 },
    { name: "Meditador", description: "Completa 30 minutos de meditación en total", category: "GENERAL" as const, condition: { type: "meditation_total_minutes", count: 30 }, xpReward: 200, coinReward: 80 },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { id: `ach_${a.name.toLowerCase().replace(/\s+/g, "_")}` },
      update: {},
      create: {
        id: `ach_${a.name.toLowerCase().replace(/\s+/g, "_")}`,
        name: a.name,
        description: a.description,
        category: a.category,
        condition: a.condition,
        xpReward: a.xpReward,
        coinReward: a.coinReward,
      },
    });
  }
  console.log(`🏆 ${achievements.length} logros creados`);

  console.log("✅ Seed completado exitosamente.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error al ejecutar el seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
