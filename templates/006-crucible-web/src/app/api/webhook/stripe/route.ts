import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getLinkedinQueue } from '@/lib/linkedin/queue';

// See /Users/aak/.claude/plans/can-we-make-this-snappy-adleman.md §Billing.
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const DEFAULT_LINKEDIN_SCHEDULES: Array<{
  job_type: 'weekly_content_batch' | 'daily_comment_check';
  cron_pattern: string;
}> = [
  { job_type: 'weekly_content_batch', cron_pattern: '0 13 * * 1' }, // Mon 9am ET
  { job_type: 'daily_comment_check', cron_pattern: '0 13 * * *' }, // 9am ET daily
];

/** Provisions a new company + empty credentials/voice-profile rows +
 * disabled default schedules on successful checkout for the LinkedIn
 * automation product. All schedules start disabled — nothing runs until the
 * owner completes credential entry in the onboarding wizard, which flips
 * them on (or the owner does so explicitly from the schedule editor). */
async function provisionLinkedinCompany(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('❌ linkedin_automation checkout completed with no metadata.userId — cannot provision a company without an owner.');
    return;
  }

  const supabase = getSupabaseAdmin();
  const companyName = session.metadata?.companyName || `Company ${session.id.slice(-8)}`;
  const baseSlug = slugify(companyName) || 'company';
  let slug = baseSlug;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase.from('companies').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: company, error } = await supabase
    .from('companies')
    .insert({
      name: companyName,
      slug,
      owner_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      plan_tier: 'linkedin_growth',
      status: 'pending_setup',
    })
    .select('id')
    .single();
  if (error || !company) {
    console.error('❌ Failed to provision linkedin company:', error?.message);
    return;
  }

  await supabase.from('company_members').insert({ company_id: company.id, user_id: userId, role: 'owner' });
  await supabase.from('company_credentials').insert({ company_id: company.id });
  await supabase.from('company_voice_profiles').insert({ company_id: company.id, filled: false });
  await supabase.from('company_schedules').insert(
    DEFAULT_LINKEDIN_SCHEDULES.map((s) => ({ company_id: company.id, ...s, enabled: false }))
  );

  console.log(`✅ Provisioned LinkedIn company ${company.id} (${slug}) for user ${userId}, pending credential setup.`);
}

/** Undoes provisionLinkedinCompany's effects: marks the company canceled,
 * disables its schedules in the DB, and removes the live BullMQ job
 * schedulers so nothing keeps firing between now and the next
 * syncCompanySchedules() reconciliation tick. */
async function deprovisionLinkedinCompany(stripeSubscriptionId: string) {
  const supabase = getSupabaseAdmin();
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .eq('plan_tier', 'linkedin_growth')
    .maybeSingle();
  if (!company) return; // not a linkedin_automation subscription — nothing to do

  await supabase.from('companies').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('id', company.id);
  const { data: schedules } = await supabase
    .from('company_schedules')
    .select('job_type')
    .eq('company_id', company.id);
  await supabase.from('company_schedules').update({ enabled: false }).eq('company_id', company.id);

  for (const s of schedules ?? []) {
    // BullMQ repeatables don't auto-clean when the DB row is disabled/deleted —
    // must explicitly remove the scheduler, or it keeps firing until the next
    // reconciliation tick (up to 5 min later per syncCompanySchedules).
    await getLinkedinQueue().removeJobScheduler(`${company.id}:${s.job_type}`).catch((err) =>
      console.error(`❌ Failed to remove job scheduler for ${company.id}:${s.job_type}:`, err)
    );
  }

  console.log(`📉 Deprovisioned LinkedIn company ${company.id} (subscription ${stripeSubscriptionId} canceled).`);
}

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

      if (session.metadata?.product === 'linkedin_automation') {
        await provisionLinkedinCompany(session);
      }
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`📉 Subscription deleted: ${subscription.id}`);
      
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id);

      await deprovisionLinkedinCompany(subscription.id);
      break;

    default:
      console.log(`ℹ️ Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
