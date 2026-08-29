import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase, enforceUniquePasswords, ensureMekyTables, seedSystemAgents, ensureSessionTable, ensureDomesticoTables, seedAuliasCurso, seedAuliasCursoAvancado, ensureVectorMemory, seedRoteirosVideo, ensureRapaduraTables, seedRapaduraUsers, ensureAgeTables } from "./lib/bootstrap";
import { seedPlaycenterAgents } from "./isa/playcenter";
import { startIsaCron } from "./isa/cron";
import { startKeepaliveCron } from "./lib/keepalive";
import { startAgeRemindersCron } from "./age/reminders";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

ensureSessionTable()
  .then(() => ensureVectorMemory())
  .then(() => seedDatabase())
  .then(() => enforceUniquePasswords())
  .then(() => ensureMekyTables())
  .then(() => ensureDomesticoTables())
  .then(() => seedSystemAgents())
  .then(() => seedPlaycenterAgents())
  .then(() => seedAuliasCurso())
  .then(() => seedAuliasCursoAvancado())
  .then(() => seedRoteirosVideo())
  .then(() => ensureRapaduraTables())
  .then(() => seedRapaduraUsers())
  .then(() => ensureAgeTables())
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
      startIsaCron();
      startKeepaliveCron();
      startAgeRemindersCron();
    });
  })
  .catch((err) => {
    logger.error({ err }, "bootstrap failed — refusing to start");
    process.exit(1);
  });
