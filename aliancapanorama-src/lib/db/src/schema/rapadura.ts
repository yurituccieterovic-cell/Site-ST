import { pgTable, serial, text, boolean, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";

export const rapaduraUsersTable = pgTable("rapadura_users", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  role: text("role").notNull(), // "yuri" | "mayumi"
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rapaduraFundosTable = pgTable("rapadura_fundos", {
  id: serial("id").primaryKey(),
  cnpj: text("cnpj").unique(),
  nome: text("nome").notNull(),
  gestora: text("gestora").notNull(),
  classe: text("classe").notNull().default("Multimercado"),
  benchmark: text("benchmark").notNull().default("CDI"),
  taxaAdm: numeric("taxa_adm", { precision: 5, scale: 2 }),
  taxaPerformance: numeric("taxa_performance", { precision: 5, scale: 2 }),
  temLinhaDAGua: boolean("tem_linha_dagua").default(true),
  prazoResgateDias: integer("prazo_resgate_dias").default(30),
  sharpe12m: numeric("sharpe_12m", { precision: 6, scale: 3 }),
  sortino12m: numeric("sortino_12m", { precision: 6, scale: 3 }),
  maxDrawdown: numeric("max_drawdown", { precision: 5, scale: 2 }),
  tempoRecuperacaoDias: integer("tempo_recuperacao_dias"),
  volatilidade12m: numeric("volatilidade_12m", { precision: 5, scale: 2 }),
  retorno12m: numeric("retorno_12m", { precision: 6, scale: 2 }),
  retorno36m: numeric("retorno_36m", { precision: 6, scale: 2 }),
  alfa36m: numeric("alfa_36m", { precision: 6, scale: 3 }),
  scoreAtratividade: numeric("score_atratividade", { precision: 5, scale: 1 }),
  scoreConfianca: numeric("score_confianca", { precision: 5, scale: 1 }),
  scoreDetalhado: jsonb("score_detalhado"),
  fontes: jsonb("fontes"),
  notas: text("notas"),
  ativo: boolean("ativo").default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rapaduraPertencesTable = pgTable("rapadura_pertences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => rapaduraUsersTable.id),
  fundoId: integer("fundo_id").notNull().references(() => rapaduraFundosTable.id),
  dataCompra: text("data_compra").notNull(),
  valorInvestido: numeric("valor_investido", { precision: 12, scale: 2 }).notNull(),
  qtdCotas: numeric("qtd_cotas", { precision: 18, scale: 6 }),
  precoCotaCompra: numeric("preco_cota_compra", { precision: 12, scale: 6 }),
  valorAtual: numeric("valor_atual", { precision: 12, scale: 2 }),
  notas: text("notas"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rapaduraAuditTable = pgTable("rapadura_audit", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  acao: text("acao").notNull(),
  detalhes: jsonb("detalhes"),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
