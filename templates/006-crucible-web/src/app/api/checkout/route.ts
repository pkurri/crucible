import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import pricingData from '@/data/pricing.json';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any,
});

function sanitizeAttribution(value: unknown) {
  if (!value || typeof value !== 'object') return {};

  return Object.fromEntries(
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].flatMap((key) => {
      const candidate = (value as Record<string, unknown>)[key];
      return typeof candidate === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(candidate)
        ? [[key, candidate]]
        : [];
    }),
  );
}

// Product-specific checkouts (e.g. the LinkedIn automation add-on) need to
// carry who's buying and what company they're buying it for through to the
// webhook, since checkout.session.completed has no session/cookie context —
// metadata is the only channel. Validated narrowly (UUID / short slug shape)
// since metadata ends up echoed back verbatim in the webhook handler.
function sanitizeProductMetadata(body: Record<string, unknown>) {
  const out: Record<string, string> = {};
  const userId = typeof body.userId === 'string' ? body.userId : '';
  const product = typeof body.product === 'string' ? body.product : '';
  const companyName = typeof body.companyName === 'string' ? body.companyName : '';
  if (/^[0-9a-f-]{36}$/i.test(userId)) out.userId = userId;
  if (/^[a-z0-9_-]{1,64}$/i.test(product)) out.product = product;
  if (companyName.length > 0 && companyName.length <= 200) out.companyName = companyName;
  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tierName, attribution } = body;
    const checkoutAttribution = sanitizeAttribution(attribution);
    const productMetadata = sanitizeProductMetadata(body);
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
        ...checkoutAttribution,
        ...productMetadata,
      }
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error('Stripe Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

