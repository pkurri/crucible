import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import pricingData from '@/data/pricing.json';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any,
});

export async function POST(req: Request) {
  try {
    const { tierName } = await req.json();
    // Fallback only - the static pricingData import below should always
    // override this with the real, current price.
    let unitAmount = 0;
    if (tierName === 'Starter') unitAmount = 4900;
    else if (tierName === 'Pro') unitAmount = 9900;
    else if (tierName === 'Enterprise') unitAmount = 49900;
    
    let description = 'AI Agent Orchestration & Premium Templates';

    // Load real pricing data (bundled at build time via static import)
    try {
      if (Array.isArray(pricingData)) {
        const tier = pricingData.find((t: any) => t.name.toLowerCase() === tierName.toLowerCase());
        if (tier && tier.price) {
          // Convert "$49/mo" or "49" to cents
          const priceVal = tier.price;
          const numeric = priceVal.replace(/[^0-9]/g, '');
          if (numeric) {
            unitAmount = parseInt(numeric) * 100;
            description = tier.description || tier.features?.join(', ') || description;
            console.log(`[STRIPE] Using real pricing for ${tierName}: ${unitAmount} cents`);
          }
        }
      }
    } catch (e) {

      console.warn('[STRIPE] Could not load pricing, falling back to defaults:', e);
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

