import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import path from 'path';
import fs from 'fs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any,
});

export async function POST(req: Request) {
  try {
    const { tierName } = await req.json();
    let unitAmount = tierName === 'Pro' ? 4900 : 0;
    let description = 'AI Agent Orchestration & Premium Templates';

    // Try to load AI-optimized pricing
    try {
      const pricingPath = path.join(process.cwd(), 'data', 'pricing.json');
      if (fs.existsSync(pricingPath)) {
        const pricing = JSON.parse(fs.readFileSync(pricingPath, 'utf8'));
        if (Array.isArray(pricing)) {
          const tier = pricing.find((t: any) => t.name.toLowerCase() === tierName.toLowerCase());
          if (tier && tier.price) {
            // Convert "$49/mo" or "49" to cents
            const priceVal = tier.price;
            const numeric = priceVal.replace(/[^0-9]/g, '');
            if (numeric) {
              unitAmount = parseInt(numeric) * 100;
              description = tier.description || tier.features?.join(', ') || description;
              console.log(`[STRIPE] Using AI-generated pricing for ${tierName}: ${unitAmount} cents`);
            }
          }
        }
      }
    } catch (e) {

      console.warn('[STRIPE] Could not load AI pricing, falling back to defaults:', e);
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Crucible ${tierName}`,
              description,
              images: ['https://zwwlcqttdmbmyfvdogwr.supabase.co/storage/v1/object/public/assets/crucible-logo.png'],
            },
            unit_amount: unitAmount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      metadata: {
        project: 'crucible',
        tier: tierName,
      }
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error('Stripe Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

