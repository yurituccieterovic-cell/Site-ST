import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase, enforceUniquePasswords, ensureMekyTables } from "./lib/bootstrap";
import { startIsaCron } from "./isa/cron";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

seedDatabase()
  .then(() => enforceUniquePasswords())
  .then(() => ensureMekyTables())
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
