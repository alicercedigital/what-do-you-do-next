import { Router, Request, Response } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";

// Type-safe query helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

const router = Router();

/**
 * Credit package definitions
 */
const CREDIT_PACKAGES = [
  { id: "credits_100", credits: 100, price: 499, currency: "usd" },
  { id: "credits_500", credits: 500, price: 1999, currency: "usd" },
  { id: "credits_1000", credits: 1000, price: 3499, currency: "usd" },
  { id: "credits_5000", credits: 5000, price: 14999, currency: "usd" },
];

/**
 * Subscription plans
 */
const SUBSCRIPTION_PLANS = [
  {
    id: "creator",
    name: "Creator",
    monthlyCredits: 500,
    price: 999,
    currency: "usd",
    features: ["500 AI credits/month", "Unlimited published universes", "Analytics dashboard"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyCredits: 2000,
    price: 1999,
    currency: "usd",
    features: [
      "2000 AI credits/month",
      "Priority AI processing",
      "Early access to features",
      "Verified creator badge",
    ],
  },
];

/**
 * Check if Stripe is configured
 */
function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

/**
 * Get Stripe instance (lazy-loaded)
 */
async function getStripe() {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured");
  }

  // Dynamically import Stripe to avoid issues if not installed
  const { default: Stripe } = await import("stripe");
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
  });
}

/**
 * Get available credit packages
 * GET /api/stripe/packages
 */
router.get("/packages", (_req, res) => {
  return res.json({ packages: CREDIT_PACKAGES });
});

/**
 * Get subscription plans
 * GET /api/stripe/plans
 */
router.get("/plans", (_req, res) => {
  return res.json({ plans: SUBSCRIPTION_PLANS });
});

/**
 * Create checkout session for credits
 * POST /api/stripe/checkout/credits
 */
router.post("/checkout/credits", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!isStripeConfigured()) {
    return res.status(503).json({ error: "Payment processing not configured" });
  }

  if (!req.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { packageId } = req.body;
  const creditPackage = CREDIT_PACKAGES.find((p) => p.id === packageId);

  if (!creditPackage) {
    return res.status(400).json({ error: "Invalid package" });
  }

  try {
    const stripe = await getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: creditPackage.currency,
            product_data: {
              name: `${creditPackage.credits} AI Credits`,
              description: `Add ${creditPackage.credits} AI credits to your account`,
            },
            unit_amount: creditPackage.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: req.user.id,
        type: "credits",
        package_id: creditPackage.id,
        credits: creditPackage.credits.toString(),
      },
      success_url: `${process.env.APP_URL}/profile/settings?success=credits`,
      cancel_url: `${process.env.APP_URL}/profile/settings?canceled=true`,
    });

    return res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

/**
 * Create checkout session for subscription
 * POST /api/stripe/checkout/subscription
 */
router.post("/checkout/subscription", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!isStripeConfigured()) {
    return res.status(503).json({ error: "Payment processing not configured" });
  }

  if (!req.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { planId } = req.body;
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);

  if (!plan) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  try {
    const stripe = await getStripe();

    // Get or create Stripe price for this plan
    const priceId = await getOrCreatePrice(stripe, plan);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: req.user.id,
        type: "subscription",
        plan_id: plan.id,
      },
      success_url: `${process.env.APP_URL}/profile/settings?success=subscription`,
      cancel_url: `${process.env.APP_URL}/profile/settings?canceled=true`,
    });

    return res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe subscription error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

/**
 * Create portal session for managing subscription
 * POST /api/stripe/portal
 */
router.post("/portal", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!isStripeConfigured() || !isSupabaseConfigured()) {
    return res.status(503).json({ error: "Payment processing not configured" });
  }

  if (!req.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    // Get user's Stripe customer ID
    const { data: profile } = await db
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", req.user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ error: "No subscription found" });
    }

    const stripe = await getStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.APP_URL}/profile/settings`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return res.status(500).json({ error: "Failed to create portal session" });
  }
});

/**
 * Stripe webhook handler
 * POST /api/stripe/webhook
 */
router.post("/webhook", async (req: Request, res: Response) => {
  if (!isStripeConfigured() || !isSupabaseConfigured()) {
    return res.status(503).json({ error: "Webhook not configured" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).json({ error: "Missing signature" });
  }

  try {
    const stripe = await getStripe();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionCanceled(subscription);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(400).json({ error: "Webhook error" });
  }
});

/**
 * Handle completed checkout session
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCheckoutComplete(session: any) {
  const metadata = session.metadata;
  const userId = metadata?.user_id;

  if (!userId) {
    console.error("No user_id in checkout session metadata");
    return;
  }

  if (metadata.type === "credits") {
    // Add credits to user's account
    const credits = parseInt(metadata.credits, 10);

    const { data: profile } = await db
      .from("profiles")
      .select("ai_credits")
      .eq("id", userId)
      .single();

    const currentCredits = profile?.ai_credits ?? 0;

    await db
      .from("profiles")
      .update({ ai_credits: currentCredits + credits })
      .eq("id", userId);

    // Record transaction
    await db.from("credit_transactions").insert({
      user_id: userId,
      amount: credits,
      type: "purchase",
      description: `Purchased ${credits} credits`,
      stripe_payment_id: session.payment_intent,
    });

    console.log(`Added ${credits} credits to user ${userId}`);
  } else if (metadata.type === "subscription") {
    // Update user's subscription status
    const planId = metadata.plan_id;
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);

    if (plan) {
      // Update profile tier
      await db
        .from("profiles")
        .update({
          tier: planId,
          stripe_customer_id: session.customer,
        })
        .eq("id", userId);

      // Create subscription record
      await db.from("subscriptions").insert({
        user_id: userId,
        stripe_subscription_id: session.subscription,
        plan_id: planId,
        status: "active",
      });

      // Add monthly credits
      const { data: profile } = await db
        .from("profiles")
        .select("ai_credits")
        .eq("id", userId)
        .single();

      const currentCredits = profile?.ai_credits ?? 0;

      await db
        .from("profiles")
        .update({ ai_credits: currentCredits + plan.monthlyCredits })
        .eq("id", userId);

      console.log(`Activated ${planId} subscription for user ${userId}`);
    }
  }
}

/**
 * Handle subscription update
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpdate(subscription: any) {
  const subscriptionId = subscription.id;
  const status = subscription.status;

  await db
    .from("subscriptions")
    .update({
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId);

  console.log(`Updated subscription ${subscriptionId} to status ${status}`);
}

/**
 * Handle subscription canceled
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionCanceled(subscription: any) {
  const subscriptionId = subscription.id;

  // Get user from subscription
  const { data: sub } = await db
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (sub?.user_id) {
    // Downgrade to free tier
    await db
      .from("profiles")
      .update({ tier: "free" })
      .eq("id", sub.user_id);

    // Mark subscription as canceled
    await db
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("stripe_subscription_id", subscriptionId);

    console.log(`Canceled subscription ${subscriptionId} for user ${sub.user_id}`);
  }
}

/**
 * Handle successful invoice payment (subscription renewal)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoicePaid(invoice: any) {
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return;

  // Get subscription and user
  const { data: sub } = await db
    .from("subscriptions")
    .select("user_id, plan_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (!sub) return;

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === sub.plan_id);
  if (!plan) return;

  // Add monthly credits for renewal
  const { data: profile } = await db
    .from("profiles")
    .select("ai_credits")
    .eq("id", sub.user_id)
    .single();

  const currentCredits = profile?.ai_credits ?? 0;

  await db
    .from("profiles")
    .update({ ai_credits: currentCredits + plan.monthlyCredits })
    .eq("id", sub.user_id);

  // Record credit transaction
  await db.from("credit_transactions").insert({
    user_id: sub.user_id,
    amount: plan.monthlyCredits,
    type: "subscription_renewal",
    description: `Monthly ${plan.name} subscription credits`,
    stripe_payment_id: invoice.payment_intent,
  });

  console.log(`Added ${plan.monthlyCredits} renewal credits to user ${sub.user_id}`);
}

/**
 * Helper: Get or create Stripe price for a plan
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrCreatePrice(stripe: any, plan: (typeof SUBSCRIPTION_PLANS)[0]): Promise<string> {
  // Look for existing price with matching plan ID in metadata
  const prices = await stripe.prices.list({
    active: true,
    lookup_keys: [`plan_${plan.id}`],
  });

  if (prices.data.length > 0) {
    return prices.data[0].id;
  }

  // Create product and price
  const product = await stripe.products.create({
    name: `${plan.name} Subscription`,
    description: plan.features.join(", "),
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.price,
    currency: plan.currency,
    recurring: { interval: "month" },
    lookup_key: `plan_${plan.id}`,
  });

  return price.id;
}

export { router as stripeRouter };
