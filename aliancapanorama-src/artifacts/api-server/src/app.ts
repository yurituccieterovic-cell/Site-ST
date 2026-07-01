import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import router from "./routes";
import { logger } from "./lib/logger";
import { isOriginAllowed } from "./lib/allowedOrigins";
import { WebhookHandlers } from "./webhookHandlers";
import { verifyPayPalWebhook } from "./paypalClient";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";

const app: Express = express();

app.set("trust proxy", 1);

const CANONICAL_HOST = "pap.sociedadetucci.com.br";
const REDIRECT_HOSTS = new Set([
  "projetoaliancapanoramapap.replit.app",
  "pap-tan-seven.vercel.app",
]);

if (process.env["NODE_ENV"] === "production") {
  app.use((req, res, next) => {
    const hostHeader = req.headers.host;
    if (typeof hostHeader === "string") {
      const host = hostHeader.split(":")[0]?.toLowerCase() ?? "";
      if (REDIRECT_HOSTS.has(host)) {
        res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
        return;
      }
    }
    next();
  });
}

// Stripe webhook MUST be registered BEFORE express.json() — needs raw Buffer
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      res.status(400).json({ error: "Missing stripe-signature" });
      return;
    }
    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (err) {
      logger.error({ err }, "stripe webhook error");
      res.status(400).json({ error: "Webhook processing error" });
    }
  },
);

// PayPal webhook MUST be registered BEFORE express.json() — needs raw Buffer
app.post(
  "/api/paypal/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const webhookId = process.env["PAYPAL_WEBHOOK_ID"];
    if (!webhookId) {
      logger.error("PAYPAL_WEBHOOK_ID not configured — rejecting webhook");
      res.status(500).json({ error: "Webhook not configured" });
      return;
    }
    const h = req.headers;
    const transmissionId = h["paypal-transmission-id"];
    const transmissionTime = h["paypal-transmission-time"];
    const certUrl = h["paypal-cert-url"];
    const authAlgo = h["paypal-auth-algo"];
    const transmissionSig = h["paypal-transmission-sig"];
    if (
      typeof transmissionId !== "string" ||
      typeof transmissionTime !== "string" ||
      typeof certUrl !== "string" ||
      typeof authAlgo !== "string" ||
      typeof transmissionSig !== "string"
    ) {
      res.status(400).json({ error: "Missing PayPal headers" });
      return;
    }
    const rawBody = req.body as Buffer;
    try {
      const ok = await verifyPayPalWebhook(
        { transmissionId, transmissionTime, certUrl, authAlgo, transmissionSig },
        webhookId,
        rawBody,
      );
      if (!ok) {
        logger.warn({ transmissionId }, "paypal webhook signature verification failed");
        res.status(400).json({ error: "Invalid signature" });
        return;
      }
      const event = JSON.parse(rawBody.toString("utf8")) as {
        event_type?: string;
        resource?: { id?: string; custom_id?: string };
      };
      const eventType = event.event_type ?? "";
      const downgradeEvents = new Set([
        "BILLING.SUBSCRIPTION.CANCELLED",
        "BILLING.SUBSCRIPTION.EXPIRED",
        "BILLING.SUBSCRIPTION.SUSPENDED",
      ]);
      if (downgradeEvents.has(eventType)) {
        const subId = event.resource?.id;
        if (subId) {
          const statusMap: Record<string, string> = {
            "BILLING.SUBSCRIPTION.CANCELLED": "cancelled",
            "BILLING.SUBSCRIPTION.EXPIRED": "expired",
            "BILLING.SUBSCRIPTION.SUSPENDED": "suspended",
          };
          const status = statusMap[eventType] ?? "cancelled";
          const result = await db.execute(
            sql`UPDATE users SET tier = 1, paypal_subscription_id = NULL, subscription_status = ${status}, last_downgrade_at = NOW() WHERE paypal_subscription_id = ${subId} RETURNING id`,
          );
          logger.info(
            { eventType, subId, affected: result.rows.length },
            "paypal webhook: downgraded user(s) to tier 1",
          );
        } else {
          logger.warn({ eventType }, "paypal webhook: no resource.id in event");
        }
      } else {
        logger.info({ eventType }, "paypal webhook received (no action)");
      }
      res.status(200).json({ received: true });
    } catch (err) {
      logger.error({ err }, "paypal webhook error");
      res.status(500).json({ error: "Webhook processing error" });
    }
  },
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env["SESSION_SECRET"];
if (!sessionSecret) throw new Error("SESSION_SECRET is required");

const isProduction = process.env["NODE_ENV"] === "production";

const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  pool,
  tableName: "session",
  createTableIfMissing: true,
});

app.use(
  session({
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

export default app;
