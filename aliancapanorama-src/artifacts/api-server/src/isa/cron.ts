import cron from "node-cron";
import { runIsaCycle } from "./cycle";
import { runBibliotecario } from "./bibliotecario";
import { runIsaBluesky } from "./bluesky";
import { logger } from "../lib/logger";

// ISA acorda em três ritmos — Railway, sem celular, sem intervenção manual
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

  logger.info("ISA: crons agendados (ciclo 1h · bibliotecário :30 · Bluesky 2h:15)");
}
