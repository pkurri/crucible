import { Request, Response } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const logger = {
  info: (msg: string, meta?: any) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[WARN] ${msg}`, meta || ''),
};

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_from_forecast_ai_design';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3003';
const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO || 'price_123456789';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any,
});

let supabase: ReturnType<typeof createClient> | null = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
} else {
  logger.warn('Supabase URL or Key missing. Database sync for payments won\'t work. Proceeding with Stripe-only mode.');
}

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { priceId = STRIPE_PRICE_PRO } = req.body;
    
    if (!priceId) {
      return res.status(400).json({ error: 'Missing or invalid priceId' });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${CLIENT_URL}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/#pricing`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });
  } catch (error: any) {
    logger.error('Error creating checkout session:', { message: error.message });
    res.status(500).json({ error: 'Failed to create checkout session. Have you set your valid STRIPE_SECRET_KEY env var?' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    // If testing locally without a webhook secret, this could fail, but in prod STRIPE_WEBHOOK_SECRET is set
    if (STRIPE_WEBHOOK_SECRET === 'whsec_placeholder') {
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    }
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', { message: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  logger.info(`Stripe webhook received: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    logger.info('Checkout completed:', { customerId, subscriptionId });

    if (supabase) {
      // Syncing over the newly created subscription to the DB architecture previously applied!
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          stripe_subscription_id: subscriptionId,
          customer_id: customerId,
          price_id: STRIPE_PRICE_PRO,
          product_name: 'Crucible Pro',
          status: 'active',
          billing_cycle: 'monthly',
        }, { onConflict: 'stripe_subscription_id' });

      if (error) {
        logger.error('Failed to save subscription to Supabase', error);
      } else {
        logger.info('Subscription successfully synced to Supabase Crucible Hub');
      }
    }
  }

  res.json({ received: true });
};
