import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase, enforceUniquePasswords, ensureMekyTables, seedSystemAgents, ensureSessionTable } from "./lib/bootstrap";
import { seedPlaycenterAgents } from "./isa/playcenter";
import { startIsaCron } from "./isa/cron";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

ensureSessionTable()
  .then(() => seedDatabase())
  .then(() => enforceUniquePasswords())
  .then(() => ensureMekyTables())
  .then(() => seedSystemAgents())
  .then(() => seedPlaycenterAgents())
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
      startIsaCron();
    });
  })
  .catch((err) => {
    logger.error({ err }, "bootstrap failed — refusing to start");
    process.exit(1);
  });
