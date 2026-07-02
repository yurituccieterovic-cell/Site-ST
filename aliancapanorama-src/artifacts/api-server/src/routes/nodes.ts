import { Router, type IRouter } from "express";
import { ListNodesQueryParams, GetNodeParams } from "@workspace/api-zod";
import { canAccess, isInAllowedSubtree } from "../lib/canAccess";
import { getAllNodes, invalidateNodeCache } from "../lib/nodeCache";

const router: IRouter = Router();

router.get("/nodes", async (req, res): Promise<void> => {
  const query = ListNodesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { parentCode } = query.data;
  const tier = req.session.userTier ?? 0;

  const { nodes: allNodes, map: nodeMap } = await getAllNodes();

  if (parentCode) {
    if (!canAccess(parentCode, tier) || !isInAllowedSubtree(parentCode, nodeMap, tier)) {
      res.status(403).json({ error: "Acesso negado para o seu nível de conta" });
      return;
    }
  }

  const accessibleCodes = new Set(
    allNodes
      .filter((n) => canAccess(n.code, tier) && isInAllowedSubtree(n.code, nodeMap, tier))
      .map((n) => n.code),
  );

  const filteredNodes = parentCode
    ? allNodes.filter((n) => n.parentCode === parentCode && accessibleCodes.has(n.code))
    : allNodes.filter((n) => (n.parentCode === null || n.parentCode === undefined) && accessibleCodes.has(n.code));

  filteredNodes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const childCounts = allNodes.reduce<Record<string, number>>((acc, n) => {
    if (n.parentCode && accessibleCodes.has(n.code)) {
      acc[n.parentCode] = (acc[n.parentCode] ?? 0) + 1;
    }
    return acc;
  }, {});

  res.json(filteredNodes.map((n) => ({
    code: n.code,
    title: n.title,
    abbreviation: n.abbreviation ?? null,
    parentCode: n.parentCode ?? null,
    childCount: childCounts[n.code] ?? 0,
    level: n.level,
    locked: false,
  })));
});

router.get("/nodes/:code", async (req, res): Promise<void> => {
  const params = GetNodeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const tier = req.session.userTier ?? 0;
  const code = params.data.code;

  if (!canAccess(code, tier)) {
    res.status(403).json({ error: "Acesso negado para o seu nível de conta" });
    return;
  }

  const { nodes: allNodes, map: nodeMap } = await getAllNodes();
  const node = nodeMap.get(code);

  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }

  if (!isInAllowedSubtree(code, nodeMap, tier)) {
    res.status(403).json({ error: "Acesso negado para o seu nível de conta" });
    return;
  }

  const accessibleCodes = new Set(
    allNodes
      .filter((n) => canAccess(n.code, tier) && isInAllowedSubtree(n.code, nodeMap, tier))
      .map((n) => n.code),
  );

  const childCounts = allNodes.reduce<Record<string, number>>((acc, n) => {
    if (n.parentCode && accessibleCodes.has(n.code)) {
      acc[n.parentCode] = (acc[n.parentCode] ?? 0) + 1;
    }
    return acc;
  }, {});

  const children = allNodes
    .filter((n) => n.parentCode === code && accessibleCodes.has(n.code))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((n) => ({
      code: n.code,
      title: n.title,
      abbreviation: n.abbreviation ?? null,
      parentCode: n.parentCode ?? null,
      childCount: childCounts[n.code] ?? 0,
      level: n.level,
      locked: false,
    }));

  res.json({
    code: node.code,
    title: node.title,
    abbreviation: node.abbreviation ?? null,
    subtitle: node.subtitle ?? null,
    content: node.content ?? null,
    imageUrl: node.imageUrl ?? null,
    parentCode: node.parentCode ?? null,
    children,
    level: node.level,
  });
});

// Permite invalidar o cache via admin (ex: após editar nodes via admin panel)
router.post("/nodes/cache/invalidate", (req, res): void => {
  if ((req.session.userTier ?? 0) < 5) {
    res.status(403).json({ error: "Apenas administradores" });
    return;
  }
  invalidateNodeCache();
  res.json({ ok: true, message: "Node cache invalidado" });
});

export default router;
