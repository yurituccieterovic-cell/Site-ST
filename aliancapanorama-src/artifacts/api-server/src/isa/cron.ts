import cron from "node-cron";
import { runIsaCycle } from "./cycle";
import { runBibliotecario } from "./bibliotecario";
import { logger } from "../lib/logger";

// ISA acorda a cada 1h — roda no Railway, sem celular, sem intervenção manual
export function startIsaCron(): void {
  // Ciclo ISA principal: análise + tasks
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

  logger.info("ISA: cron agendado (ciclo 1h + bibliotecário 30min)");
}
