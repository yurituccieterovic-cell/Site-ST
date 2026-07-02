import type { Request, Response, NextFunction } from "express";

const DB_API_KEY = process.env["DB_API_KEY"] ?? "";

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  if (!DB_API_KEY) {
    // Sem chave configurada — rota desabilitada por segurança
    res.status(503).json({ error: "Autenticação machine-to-machine não configurada" });
    return;
  }
  const key = req.headers["x-pap-key"];
  if (typeof key !== "string" || key !== DB_API_KEY) {
    res.status(401).json({ error: "X-PAP-Key inválida ou ausente" });
    return;
  }
  next();
}
