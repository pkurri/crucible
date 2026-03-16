import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      console.warn('⚠️ STRIPE_WEBHOOK_SECRET is not set. Verification skipped.');
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    }
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email;
      const tier = session.metadata?.tier || 'Pro';

      console.log(`💰 Payment received from ${customerEmail} for ${tier}`);

      // Sync to Supabase
      if (customerEmail) {
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            email: customerEmail,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            tier: tier,
            status: 'active',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' });

        if (error) {
          console.error('❌ Failed to sync subscription to Supabase:', error);
        } else {
          console.log('✅ Subscription synced to Supabase.');
        }
      }
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`📉 Subscription deleted: ${subscription.id}`);
      
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id);
      break;

    default:
      console.log(`ℹ️ Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
