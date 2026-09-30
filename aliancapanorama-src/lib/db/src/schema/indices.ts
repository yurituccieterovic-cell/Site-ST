/**
 * indices.ts — Zod schemas para os 9 Índices Ontológicos de uma Task
 * Baseado em: cursos/aula-tasks-parte1-4.md (RODARs #557-#561)
 *
 * Uso: validateIndexData(indexId, data) → { success, data | error }
 */
import { z } from "zod/v4";

// ── Índice 0 — Estrutura Base (meta) ────────────────────────────────────────
export const index0Schema = z.object({
  codigo: z.string().optional(),            // ex: "121aaa"
  tipo_entidade: z.string().optional(),     // task | subtask | macro | milestone
  indice_omega: z.string().optional(),      // telos emergente desta task
  phi: z.number().min(0).max(1).optional(), // coerência calculada (0-1)
  vitalidade: z.number().min(0).max(1).optional(),
}).passthrough();

// ── Índice 1 — Informação ────────────────────────────────────────────────────
export const index1Schema = z.object({
  fonte_origem: z.string().optional(),
  precisao_perc: z.number().min(0).max(100).optional(),
  verificabilidade: z.enum(["alta","media","baixa","nao_verificavel"]).optional(),
  formato_signo: z.string().optional(),     // texto | código | diagrama | áudio
  metadados_tecnicos: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

// ── Índice 2 — Orientação ────────────────────────────────────────────────────
export const index2Schema = z.object({
  direcao_metodologica: z.string().optional(),
  sequencia_passos: z.array(z.string()).optional(),
  prioridade_logica: z.number().min(0).max(10).optional(),
  caminho_grafo: z.string().optional(),     // path no grafo de tasks
  telos_local_ref: z.string().optional(),   // ID do telos local desta task
}).passthrough();

// ── Índice 3 — Organização ───────────────────────────────────────────────────
export const index3Schema = z.object({
  estrutura_nivel: z.number().min(0).optional(),   // profundidade na hierarquia
  responsavel_id: z.string().optional(),
  prazo_limite: z.string().optional(),             // ISO 8601
  dependencia_adm_ids: z.array(z.number()).optional(),
  alocacao_recursos: z.string().optional(),
}).passthrough();

// ── Índice 4 — Manifestação ──────────────────────────────────────────────────
export const index4Schema = z.object({
  modo_perspectiva: z.string().optional(),         // estratégico | tático | operacional
  suporte_media: z.string().optional(),            // texto | vídeo | código | UI
  modo_apresentacao: z.string().optional(),
  eco_dimensional: z.string().optional(),          // impacto em outras dimensões
  registro_perceptivo: z.string().optional(),
}).passthrough();

// ── Índice 5 — Significante ──────────────────────────────────────────────────
export const index5Schema = z.object({
  codigo_alfanumerico: z.string().optional(),      // identificador semântico
  simbolo_icone: z.string().optional(),            // emoji ou slug de ícone
  funcao_biblioteca: z.string().optional(),        // função/método associado
  chave_externa: z.string().optional(),            // ID em sistema externo
  preco_valor_monetario: z.number().optional(),    // se task tem valor econômico
}).passthrough();

// ── Índice 6 — Interferência ─────────────────────────────────────────────────
export const index6Schema = z.object({
  tipo_interferencia: z.enum(["bloqueio","tensao","oportunidade","neutro"]).optional(),
  severidade: z.number().min(0).max(10).optional(),
  potencial_produtivo: z.string().optional(),      // como a tensão pode gerar valor
  resolucao_subversao: z.string().optional(),
  indice_gerador_ref: z.number().optional(),       // qual índice gerou a interferência
}).passthrough();

// ── Índice 7 — Registro ──────────────────────────────────────────────────────
export const index7Schema = z.object({
  nome_proprio: z.string().optional(),             // nome canônico desta task
  especie_tipo: z.string().optional(),             // classificação taxonômica
  geolocalizacao: z.string().optional(),           // contexto geográfico/espacial
  proveniencia_historica: z.string().optional(),   // de onde surgiu
  assinatura_autorizacao: z.string().optional(),   // quem autorizou
}).passthrough();

// ── Índice 8 — Dinâmica ──────────────────────────────────────────────────────
export const index8Schema = z.object({
  tipo_acao: z.enum(["criacao","transformacao","dissolucao","propagacao"]).optional(),
  task_origem_id: z.number().optional(),
  task_destino_id: z.number().optional(),
  codigo_relacao_interp: z.string().optional(),    // código da relação interpretante
  trigger_condicao: z.string().optional(),         // condição que dispara esta task
}).passthrough();

// ── Índice 9 — Mentalidade ───────────────────────────────────────────────────
export const index9Schema = z.object({
  modo_cognitivo: z.enum(["analítico","sintético","intuitivo","crítico"]).optional(),
  hipotese_trabalho: z.string().optional(),
  analise_decomposicao: z.array(z.string()).optional(),
  sintese_conclusao: z.string().optional(),
  nivel_abstracao: z.number().min(0).max(10).optional(),
}).passthrough();

// ── Mapa de índices ──────────────────────────────────────────────────────────
export const INDEX_SCHEMAS = {
  0: index0Schema,
  1: index1Schema,
  2: index2Schema,
  3: index3Schema,
  4: index4Schema,
  5: index5Schema,
  6: index6Schema,
  7: index7Schema,
  8: index8Schema,
  9: index9Schema,
} as const;

export type IndexId = keyof typeof INDEX_SCHEMAS;

export function validateIndexData(indexId: number, data: unknown) {
  const schema = INDEX_SCHEMAS[indexId as IndexId];
  if (!schema) return { success: false as const, error: `Índice ${indexId} não existe (0-9)` };
  const result = schema.safeParse(data);
  if (!result.success) return { success: false as const, error: result.error.flatten() };
  return { success: true as const, data: result.data };
}

/**
 * Calcula Φ (coerência) de uma task: fração de índices 1-9 com ao menos 1 campo preenchido.
 * Resultado: 0.0 (vazio) → 1.0 (todos os índices têm dados).
 */
export function calcularPhi(indicesData: Record<string, unknown>): number {
  let preenchidos = 0;
  for (let i = 1; i <= 9; i++) {
    const idx = indicesData[String(i)];
    if (idx && typeof idx === "object" && Object.keys(idx).length > 0) preenchidos++;
  }
  return Math.round((preenchidos / 9) * 100) / 100;
}
