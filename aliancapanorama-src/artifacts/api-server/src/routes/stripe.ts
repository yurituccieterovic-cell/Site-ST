import type Stripe from "stripe";
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getUncachableStripeClient, getStripePublishableKey } from "../stripeClient";

const router: IRouter = Router();

const APP_URL = process.env.APP_URL ?? "https://pap.sociedadetucci.com.br";

/* ── GET /api/stripe/plans ────────────────────────────────────────────────── */
router.get("/stripe/plans", async (_req, res): Promise<void> => {
  try {
    const stripe = await getUncachableStripeClient();
    const publishableKey = getStripePublishableKey();
    const prices = await stripe.prices.list({
      active: true,
      type: "recurring",
      expand: ["data.product"],
      limit: 20,
    });

    const plans = prices.data
      .filter((p) => {
        const prod = p.product as Stripe.Product;
        return prod && typeof prod === "object" && prod.active;
      })
      .sort((a, b) => (a.unit_amount ?? 0) - (b.unit_amount ?? 0))
      .map((p) => {
        const product = p.product as Stripe.Product;
        return {
          product_id: product.id,
          name: product.name,
          description: product.description,
          metadata: product.metadata,
          price_id: p.id,
          unit_amount: p.unit_amount,
          currency: p.currency,
          recurring: p.recurring,
        };
      });

    res.json({ plans, publishableKey });
  } catch {
    res.json({ plans: [] });
  }
});

/* ── POST /api/stripe/checkout ───────────────────────────────────────────── */
router.post("/stripe/checkout", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }

  const { priceId } = req.body as { priceId?: string };
  if (!priceId) {
    res.status(400).json({ error: "priceId obrigatório" });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId));

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    const stripe = await getUncachableStripeClient();

    let customerId = (user as typeof user & { stripeCustomerId?: string }).stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: user.displayName ?? user.login,
        metadata: { userId: String(user.id), login: user.login },
      });
      customerId = customer.id;
      await db.execute(
        sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${user.id}`,
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card", "boleto", "pix"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${APP_URL}/?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/?stripe=cancel`,
      allow_promotion_codes: true,
      payment_method_options: {
        pix: { expires_after_seconds: 3600 },
        boleto: { expires_after_days: 3 },
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    req.log.error(err, "stripe checkout failed");
    res.status(500).json({ error: "Falha ao criar sessão de pagamento" });
  }
});

/* ── GET /api/stripe/sync-tier ───────────────────────────────────────────── */
router.get("/stripe/sync-tier", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }

  try {
    const rows = await db.execute(
      sql`SELECT stripe_customer_id FROM users WHERE id = ${req.session.userId}`,
    );
    const row = rows.rows[0] as { stripe_customer_id?: string } | undefined;
    const customerId = row?.stripe_customer_id;

    if (!customerId) {
      res.json({ tier: req.session.userTier ?? 1, synced: false });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
      expand: ["data.items.data.price.product"],
    });

    let newTier: number = 1;
    if (subs.data.length > 0) {
      const sub = subs.data[0];
      const priceItem = sub.items.data[0];
      const product = priceItem?.price?.product;
      if (product && typeof product === "object" && "metadata" in product) {
        const tierStr = (product.metadata as Record<string, string>)?.tier;
        if (tierStr) newTier = Math.min(4, Math.max(1, parseInt(tierStr, 10)));
      }
    }

    await db
      .update(usersTable)
      .set({ tier: newTier })
      .where(eq(usersTable.id, req.session.userId));

    if (newTier > 1) {
      await db.execute(
        sql`UPDATE users SET subscription_status = 'active', last_downgrade_at = NULL WHERE id = ${req.session.userId}`,
      );
    }

    req.session.userTier = newTier;
    res.json({ tier: newTier, synced: true });
  } catch (err) {
    req.log.error(err, "stripe sync-tier failed");
    res.status(500).json({ error: "Falha ao sincronizar plano" });
  }
});

/* ── POST /api/stripe/portal ─────────────────────────────────────────────── */
router.post("/stripe/portal", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }

  try {
    const rows = await db.execute(
      sql`SELECT stripe_customer_id FROM users WHERE id = ${req.session.userId}`,
    );
    const row = rows.rows[0] as { stripe_customer_id?: string } | undefined;
    const customerId = row?.stripe_customer_id;

    if (!customerId) {
      res.status(400).json({ error: "Nenhuma assinatura encontrada" });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/`,
    });

    res.json({ url: portalSession.url });
  } catch (err) {
    req.log.error(err, "stripe portal failed");
    res.status(500).json({ error: "Falha ao abrir portal de assinatura" });
  }
});

export default router;
