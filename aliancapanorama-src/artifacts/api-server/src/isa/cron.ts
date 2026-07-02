import cron from "node-cron";
import { runIsaCycle } from "./cycle";
import { logger } from "../lib/logger";

// ISA acorda a cada 1h — roda no Railway, sem celular, sem intervenção manual
export function startIsaCron(): void {
  cron.schedule("0 * * * *", async () => {
    try {
      logger.info("ISA: ciclo horário disparado pelo cron");
      const result = await runIsaCycle();
      logger.info(result, "ISA: ciclo horário concluído");
    } catch (err) {
      logger.error({ err }, "ISA: erro no ciclo horário");
    }
  });

  logger.info("ISA: cron agendado (a cada 1h)");
}
