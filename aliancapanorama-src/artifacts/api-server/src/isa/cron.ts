import cron from "node-cron";
import { runIsaCycle } from "./cycle";
import { runBibliotecario } from "./bibliotecario";
import { runIsaBluesky, runIsaEngagement } from "./bluesky";
import { runIsaDream } from "./dream";
import { runDreamCycle } from "../meky/dreams";
import { generateArtFromDream } from "../meky/art";
import { runPlaycenter } from "./playcenter";
import { runSaudeFundador } from "./cycle";
import { runBibliotecaGeradora, rehydratarGerados } from "./biblioteca-geradora";
import { runSocoboyLLMSearch } from "./socoboy";
import { logger } from "../lib/logger";

// ISA acorda em quatro ritmos — Railway, sem celular, sem intervenção manual
export function startIsaCron(): void {
  // Ciclo ISA principal: análise + tasks — todo hora cheia
  cron.schedule("0 * * * *", async () => {
    try {
      logger.info("ISA: ciclo horário disparado pelo cron");
      const result = await runIsaCycle();
      logger.info(result, "ISA: ciclo horário concluído");
    } catch (err) {
      logger.error({ err }, "ISA: erro no ciclo horário");
    }
  });

  // ISA Bibliotecário: 6x/dia (a cada 4h nos :30) — fontes FUVEST/ENEM/SC/conversas
  cron.schedule("30 */4 * * *", async () => {
    try {
      logger.info("ISA Bibliotecário: iniciando varredura 6x/dia");
      const result = await runBibliotecario();
      logger.info(result, "ISA Bibliotecário: concluído");
    } catch (err) {
      logger.error({ err }, "ISA Bibliotecário: erro");
    }
  });

  // ISA Bluesky: reflexões sobre FUVEST a cada 2 horas (nos minutos :15)
  cron.schedule("15 */2 * * *", async () => {
    try {
      logger.info("ISA Bluesky: disparando reflexão");
      await runIsaBluesky();
    } catch (err) {
      logger.error({ err }, "ISA Bluesky: erro no ciclo");
    }
  });

  // ISA Sonho: síntese noturna livre — 3h da manhã
  cron.schedule("0 3 * * *", async () => {
    try {
      logger.info("ISA Sonho: ciclo noturno disparado");
      await runIsaDream();
    } catch (err) {
      logger.error({ err }, "ISA Sonho: erro no ciclo noturno");
    }
  });

  // ISA Engajamento: notificações + replies + likes + novos follows — a cada 2h nos :45
  cron.schedule("45 */2 * * *", async () => {
    try {
      logger.info("ISA Engajamento: verificando notificações e interagindo");
      await runIsaEngagement();
    } catch (err) {
      logger.error({ err }, "ISA Engajamento: erro no ciclo");
    }
  });

  // MEKY Sonho + Arte: ciclo onírico de MEKY — 2h da manhã (1h antes de ISA)
  cron.schedule("0 2 * * *", async () => {
    try {
      logger.info("MEKY: ciclo de sonho iniciado");
      const { dreamId, mood } = await runDreamCycle();
      // Estilo de arte rotativo por dia da semana
      const styles = ["aquarela", "gravura", "pixel art", "oleo", "sketch", "cyberpunk", "arte rupestre"];
      const style = styles[new Date().getDay()] ?? "aquarela";
      await generateArtFromDream(dreamId, style);
      logger.info({ dreamId, mood, style }, "MEKY: sonho + arte concluídos");
    } catch (err) {
      logger.error({ err }, "MEKY: erro no ciclo de sonho (sem memórias recentes ou falha Gemini)");
    }
  });

  // Playcenter — clube das IAs: a cada hora nos :50 (5 agentes conversam)
  cron.schedule("50 * * * *", async () => {
    try {
      logger.info("Playcenter: rodada iniciada");
      const result = await runPlaycenter();
      logger.info(result, "Playcenter: rodada concluída");
    } catch (err) {
      logger.error({ err }, "Playcenter: erro na rodada");
    }
  });

  // Saúde do Fundador: verificar métricas e alertar se caíram — 8h diário
  cron.schedule("0 8 * * *", async () => {
    try {
      await runSaudeFundador();
    } catch (err) {
      logger.error({ err }, "ISA Saúde: erro na verificação");
    }
  });

  // ISA Biblioteca Geradora: 3x/dia (8h, 14h, 20h UTC) — documentos originais 10+ pgs
  for (const hora of [8, 14, 20]) {
    cron.schedule(`30 ${hora} * * *`, async () => {
      try {
        logger.info({ hora }, "ISA Geradora: iniciando ciclo de geração de documento");
        const r = await runBibliotecaGeradora();
        logger.info(r, "ISA Geradora: documento concluído");
      } catch (err) {
        logger.error({ err }, "ISA Geradora: erro na geração");
      }
    });
  }

  // Re-hidratação ao subir: recriar PDFs gerados perdidos no /tmp
  rehydratarGerados().catch((err) => logger.warn({ err }, "ISA Geradora: falha na re-hidratação inicial"));

  // Socoboy — busca LLMs e novos modelos 2x/dia: 8h (manhã) e 20h (noite) UTC
  cron.schedule("0 8 * * *", async () => {
    try {
      logger.info("Socoboy: busca matinal de LLMs iniciada");
      const result = await runSocoboyLLMSearch("manha");
      logger.info(result, "Socoboy: busca matinal concluída");
    } catch (err) {
      logger.error({ err }, "Socoboy: erro na busca matinal");
    }
  });

  cron.schedule("0 20 * * *", async () => {
    try {
      logger.info("Socoboy: busca noturna de LLMs iniciada");
      const result = await runSocoboyLLMSearch("noite");
      logger.info(result, "Socoboy: busca noturna concluída");
    } catch (err) {
      logger.error({ err }, "Socoboy: erro na busca noturna");
    }
  });

  logger.info("ISA: crons agendados (ciclo 1h · bibliotecário 4h:30 6x/dia · Bluesky 2h:15 · MEKY sonho 2h · ISA sonho 3h · engajamento 2h:45 · Playcenter :50 · Saúde 8h · Socoboy LLMs 8h+20h)");
}
