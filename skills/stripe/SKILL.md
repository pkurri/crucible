---
name: stripe
description: >
  Stripe integration: subscriptions, one-time payments, webhooks, customer portal,
  metered billing. Full patterns for SaaS billing. Use for any payment feature.
triggers:
  - "stripe"
  - "payments"
  - "subscription"
  - "billing"
  - "metered"
---

# Service: Stripe

Full Stripe integration patterns for SaaS products.

## Setup

```bash
pnpm add stripe @stripe/stripe-js
```

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})
```

## Subscription Checkout

```typescript
// src/app/api/checkout/route.ts
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const { priceId, userId, userEmail } = await req.json()

  // Get or create Stripe customer
  let customerId = await getStripeCustomerId(userId)
  if (!customerId) {
    const customer = await stripe.customers.create({ email: userEmail })
    customerId = customer.id
    await saveStripeCustomerId(userId, customerId)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    subscription_data: {
      metadata: { userId },
    },
  })

  return Response.json({ url: session.url })
}
```

## Webhook Handler

```typescript
// src/app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      await activateSubscription(session.metadata!.userId, session.subscription as string)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      await deactivateSubscription(sub.metadata.userId)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object
      await notifyPaymentFailed(invoice.customer as string)
      break
    }
  }

  return new Response('OK', { status: 200 })
}
```

## Customer Portal

```typescript
// Let users manage their subscription
export async function POST(req: Request) {
  const { customerId } = await req.json()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
  return Response.json({ url: session.url })
}
```

## Environment Variables

```
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
# Price IDs from Stripe dashboard
STRIPE_PRICE_PRO_MONTHLY=price_xxxx
STRIPE_PRICE_PRO_ANNUAL=price_xxxx
```

## Local Webhook Testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
