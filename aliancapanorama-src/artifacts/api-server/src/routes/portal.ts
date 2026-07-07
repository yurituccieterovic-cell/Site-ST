import { Router } from "express";
import { db, usersTable, exerciseAttemptsTable, exercisesTable } from "@workspace/db";
import { sql, count, gte, and } from "drizzle-orm";

const router = Router();

function isSuperAdm(tier: number) { return tier >= 9; }
function isAdm(tier: number)      { return tier >= 5; }

router.get("/portal/stats", async (req, res) => {
  const tier = req.session.userTier ?? 0;
  if (!isAdm(tier)) { res.status(403).json({ error: "Acesso negado" }); return; }

  const now = new Date();
  const oneDayAgo  = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    usersByTier,
    totalExercises,
    attemptsToday,
    attemptsWeek,
    recentUsers,
  ] = await Promise.all([
    // total usuários
    db.select({ count: count() }).from(usersTable),

    // usuários por tier
    db.select({ tier: usersTable.tier, count: count() })
      .from(usersTable)
      .groupBy(usersTable.tier),

    // total exercícios gerados
    db.select({ count: count() }).from(exercisesTable),

    // tentativas últimas 24h
    db.select({ count: count() })
      .from(exerciseAttemptsTable)
      .where(gte(exerciseAttemptsTable.createdAt, oneDayAgo)),

    // tentativas últimos 7 dias
    db.select({ count: count() })
      .from(exerciseAttemptsTable)
      .where(gte(exerciseAttemptsTable.createdAt, sevenDaysAgo)),

    // últimos 10 usuários cadastrados (superadm only)
    isSuperAdm(tier) ? db.select({
      id: usersTable.id,
      login: usersTable.login,
      tier: usersTable.tier,
      displayName: usersTable.displayName,
      createdAt: usersTable.createdAt,
      subscriptionStatus: usersTable.subscriptionStatus,
    }).from(usersTable)
      .orderBy(sql`${usersTable.createdAt} desc`)
      .limit(10)
    : Promise.resolve([]),
  ]);

  // top nodes por tentativas (últimos 7 dias)
  const topNodes = await db
    .select({
      nodeCode: exerciseAttemptsTable.nodeCode,
      attempts: count(),
      correct: sql<number>`sum(${exerciseAttemptsTable.correct})`,
    })
    .from(exerciseAttemptsTable)
    .where(gte(exerciseAttemptsTable.createdAt, sevenDaysAgo))
    .groupBy(exerciseAttemptsTable.nodeCode)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  res.json({
    superAdm: isSuperAdm(tier),
    totalUsers: totalUsers[0]?.count ?? 0,
    usersByTier,
    totalExercises: totalExercises[0]?.count ?? 0,
    attemptsToday: attemptsToday[0]?.count ?? 0,
    attemptsWeek: attemptsWeek[0]?.count ?? 0,
    topNodes,
    recentUsers,
  });
});

export default router;
