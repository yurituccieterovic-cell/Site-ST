import type Stripe from "stripe";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { getUncachableStripeClient, getStripeWebhookSecret } from "./stripeClient";
import { logger } from "./lib/logger";

const DOWNGRADE_STATUSES = new Set<Stripe.Subscription.Status>([
  "canceled",
  "unpaid",
  "incomplete_expired",
  "paused",
  "past_due",
]);

async function downgradeUserByCustomerId(
  customerId: string,
  reason: string,
  status: string,
): Promise<void> {
  const result = await db.execute(
    sql`UPDATE users SET tier = 1, subscription_status = ${status}, last_downgrade_at = NOW() WHERE stripe_customer_id = ${customerId} RETURNING id`,
  );
  logger.info(
    { reason, customerId, affected: result.rows.length },
    "stripe webhook: downgraded user(s) to tier 1",
  );
}

async function handleSubscriptionEvent(event: Stripe.Event): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const customer = sub.customer;
  const customerId = typeof customer === "string" ? customer : customer?.id;
  if (!customerId) {
    logger.warn(
      { eventType: event.type, subId: sub.id },
      "stripe webhook: no customer on subscription",
    );
    return;
  }

  if (event.type === "customer.subscription.deleted") {
    await downgradeUserByCustomerId(customerId, `event:${event.type}`, "cancelled");
    return;
  }

  if (
    event.type === "customer.subscription.updated" &&
    DOWNGRADE_STATUSES.has(sub.status)
  ) {
    const statusLabel = sub.status === "past_due" || sub.status === "unpaid"
      ? "past_due"
      : sub.status === "paused"
      ? "suspended"
      : sub.status === "incomplete_expired"
      ? "expired"
      : "cancelled";
    await downgradeUserByCustomerId(
      customerId,
      `event:${event.type} status:${sub.status}`,
      statusLabel,
    );
  }
}

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK: payload não é Buffer. " +
          "O express.json() está sendo aplicado antes do webhook. " +
          "Registre o webhook ANTES de app.use(express.json()).",
      );
    }

    const webhookSecret = getStripeWebhookSecret();

    const stripe = await getUncachableStripeClient();
    const event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
    );

    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.updated"
    ) {
      await handleSubscriptionEvent(event);
    }
  }
}
