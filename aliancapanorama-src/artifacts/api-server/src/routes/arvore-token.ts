import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

const TOKENS_PER_TREE = 1000;

function checkBridgeAuth(req: any, res: any): boolean {
  const bridge = process.env.BRIDGE_SECRET;
  const auth = req.headers.authorization?.replace("Bearer ", "") || req.body?.bridge_secret;
  if (!bridge || auth !== bridge) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

async function getOrCreateWallet(wallet: string, displayName?: string) {
  await db.execute(sql`
    INSERT INTO arvore_token_wallets (wallet, display_name, balance)
    VALUES (${wallet}, ${displayName ?? wallet}, 0)
    ON CONFLICT (wallet) DO NOTHING
  `);
}

// GET /api/arvore-token/stats
router.get("/api/arvore-token/stats", async (_req, res) => {
  try {
    const [stats] = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'alive') AS trees_alive,
        COUNT(*) FILTER (WHERE status = 'dead')  AS trees_dead,
        COUNT(*) AS trees_total,
        COALESCE(SUM(tokens_minted) FILTER (WHERE status = 'alive'), 0) AS supply_circulating,
        COALESCE(SUM(tokens_minted), 0) AS supply_ever_minted
      FROM arvore_token_trees
    `);
    res.json(stats.rows[0] ?? { trees_alive: 0, trees_dead: 0, trees_total: 0, supply_circulating: 0, supply_ever_minted: 0 });
  } catch (e: any) {
    logger.error("arvore-token stats", e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/arvore-token/trees?limit=50&offset=0&status=alive
router.get("/api/arvore-token/trees", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const status = req.query.status as string | undefined;

    const rows = await db.execute(sql`
      SELECT * FROM arvore_token_trees
      ${status ? sql`WHERE status = ${status}` : sql``}
      ORDER BY planted_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    res.json(rows.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/arvore-token/plant — mint tokens for a new tree (custódio only)
router.post("/api/arvore-token/plant", async (req, res) => {
  if (!checkBridgeAuth(req, res)) return;
  const { tree_id, planter, gps_lat, gps_lng, cert_hash, species, notes } = req.body;
  if (!tree_id || !planter) {
    return res.status(400).json({ error: "tree_id e planter obrigatórios" });
  }
  try {
    await getOrCreateWallet(planter);

    await db.execute(sql`
      INSERT INTO arvore_token_trees (tree_id, planter, gps_lat, gps_lng, cert_hash, species, notes, status, tokens_minted)
      VALUES (${tree_id}, ${planter}, ${gps_lat ?? null}, ${gps_lng ?? null}, ${cert_hash ?? null}, ${species ?? "nativa"}, ${notes ?? null}, 'alive', ${TOKENS_PER_TREE})
    `);

    await db.execute(sql`
      UPDATE arvore_token_wallets SET balance = balance + ${TOKENS_PER_TREE} WHERE wallet = ${planter}
    `);

    await db.execute(sql`
      INSERT INTO arvore_token_ledger (tx_type, to_wallet, amount, tree_id, memo)
      VALUES ('mint', ${planter}, ${TOKENS_PER_TREE}, ${tree_id}, 'Plantio verificado')
    `);

    logger.info(`arvore-token: mint ${TOKENS_PER_TREE} ARVR → ${planter} (árvore ${tree_id})`);
    res.json({ ok: true, tree_id, tokens_minted: TOKENS_PER_TREE, planter });
  } catch (e: any) {
    if (e.message?.includes("unique")) return res.status(409).json({ error: "tree_id já existe" });
    res.status(500).json({ error: e.message });
  }
});

// POST /api/arvore-token/report-death — burn tokens when tree dies (custódio only)
router.post("/api/arvore-token/report-death", async (req, res) => {
  if (!checkBridgeAuth(req, res)) return;
  const { tree_id, notes } = req.body;
  if (!tree_id) return res.status(400).json({ error: "tree_id obrigatório" });
  try {
    const trees = await db.execute(sql`
      SELECT * FROM arvore_token_trees WHERE tree_id = ${tree_id}
    `);
    const tree = trees.rows[0] as any;
    if (!tree) return res.status(404).json({ error: "árvore não encontrada" });
    if (tree.status === "dead") return res.status(409).json({ error: "árvore já morta" });

    await db.execute(sql`
      UPDATE arvore_token_trees SET status = 'dead', died_at = NOW(), notes = COALESCE(${notes ?? null}, notes) WHERE tree_id = ${tree_id}
    `);

    const wallets = await db.execute(sql`
      SELECT balance FROM arvore_token_wallets WHERE wallet = ${tree.planter}
    `);
    const balance = (wallets.rows[0] as any)?.balance ?? 0;
    const toBurn = Math.min(tree.tokens_minted, balance);

    if (toBurn > 0) {
      await db.execute(sql`
        UPDATE arvore_token_wallets SET balance = balance - ${toBurn} WHERE wallet = ${tree.planter}
      `);
      await db.execute(sql`
        INSERT INTO arvore_token_ledger (tx_type, from_wallet, amount, tree_id, memo)
        VALUES ('burn', ${tree.planter}, ${toBurn}, ${tree_id}, 'Árvore morta — queima automática')
      `);
    }

    logger.info(`arvore-token: burn ${toBurn} ARVR de ${tree.planter} (árvore ${tree_id} morta)`);
    res.json({ ok: true, tree_id, tokens_burned: toBurn, planter: tree.planter });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/arvore-token/transfer
router.post("/api/arvore-token/transfer", async (req, res) => {
  if (!checkBridgeAuth(req, res)) return;
  const { from_wallet, to_wallet, amount, memo } = req.body;
  if (!from_wallet || !to_wallet || !amount || amount <= 0) {
    return res.status(400).json({ error: "from_wallet, to_wallet, amount obrigatórios" });
  }
  try {
    const froms = await db.execute(sql`SELECT balance FROM arvore_token_wallets WHERE wallet = ${from_wallet}`);
    const bal = (froms.rows[0] as any)?.balance ?? 0;
    if (bal < amount) return res.status(400).json({ error: "saldo insuficiente", balance: bal });

    await getOrCreateWallet(to_wallet);
    await db.execute(sql`UPDATE arvore_token_wallets SET balance = balance - ${amount} WHERE wallet = ${from_wallet}`);
    await db.execute(sql`UPDATE arvore_token_wallets SET balance = balance + ${amount} WHERE wallet = ${to_wallet}`);
    await db.execute(sql`
      INSERT INTO arvore_token_ledger (tx_type, from_wallet, to_wallet, amount, memo)
      VALUES ('transfer', ${from_wallet}, ${to_wallet}, ${amount}, ${memo ?? null})
    `);

    res.json({ ok: true, from_wallet, to_wallet, amount });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/arvore-token/wallet/:address
router.get("/api/arvore-token/wallet/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const wallets = await db.execute(sql`SELECT * FROM arvore_token_wallets WHERE wallet = ${address}`);
    const trees = await db.execute(sql`
      SELECT tree_id, species, status, tokens_minted, planted_at, died_at FROM arvore_token_trees WHERE planter = ${address} ORDER BY planted_at DESC LIMIT 20
    `);
    const wallet = wallets.rows[0] ?? { wallet: address, balance: 0 };
    res.json({ ...wallet, trees: trees.rows });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/arvore-token/ledger?limit=50
router.get("/api/arvore-token/ledger", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const rows = await db.execute(sql`
      SELECT * FROM arvore_token_ledger ORDER BY created_at DESC LIMIT ${limit}
    `);
    res.json(rows.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
