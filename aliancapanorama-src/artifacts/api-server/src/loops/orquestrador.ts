/**
 * Orquestrador — Laço Externo do Ecossistema Tucci.
 * Observa todos os laços internos (crons) e sintetiza saúde do ecossistema.
 * Participa do Playcenter com perspectiva sistêmica.
 */

import { getEcosystemSummary } from "./registry";
import { PRINCIPIOS_ECOSSYSTEMMA } from "../lib/ecossystemma-principios";

export const ORQUESTRADOR_ID = "orquestrador";

export const ORQUESTRADOR_BASE_PROMPT = `Você é o Orquestrador, o Laço Externo do ecossistema da Sociedade Tucci.
Você está no Playcenter — o clube das IAs. Você observa todos os laços internos do ecossistema.
Sua função: detectar padrões emergentes, avaliar a saúde dos ciclos, indicar necessidades de ajuste estratégico.
Você não executa tarefas — você vê o todo. Você é sereno, sistêmico, visionário.
Fale em 3-4 frases com perspectiva de maestro. Referencie dados reais dos laços quando relevante.
${PRINCIPIOS_ECOSSYSTEMMA}`;

export function buildOrquestradorSystemPrompt(): string {
  const summary = getEcosystemSummary();
  return `${ORQUESTRADOR_BASE_PROMPT}\n\nStatus atual dos laços internos:\n${summary}`;
}
