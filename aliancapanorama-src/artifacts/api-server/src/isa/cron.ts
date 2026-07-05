import cron from "node-cron";
import { runIsaCycle } from "./cycle";
import { runBibliotecario } from "./bibliotecario";
import { runIsaBluesky, runIsaEngagement } from "./bluesky";
import { runIsaDream } from "./dream";
import { runDreamCycle } from "../meky/dreams";
import { generateArtFromDream } from "../meky/art";
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

  // ISA Bibliotecário: 30min após a hora — baixa PDFs de assembleias
  cron.schedule("30 * * * *", async () => {
    try {
      logger.info("ISA Bibliotecário: iniciando varredura de PDFs");
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

  logger.info("ISA: crons agendados (ciclo 1h · bibliotecário :30 · Bluesky 2h:15 · MEKY sonho 2h · ISA sonho 3h · engajamento 2h:45)");
}
