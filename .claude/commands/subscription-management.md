---
name: subscription-management
description:
  Complete subscription billing platform with Stripe integration, usage
  tracking, and invoicing. Use when implementing SaaS billing, managing
  subscriptions, setting up payment flows, or tracking customer usage.
triggers:
  - 'subscription'
  - 'billing'
  - 'stripe'
  - 'payment'
  - 'invoice'
  - 'metered billing'
---

# Subscription Management

Complete SaaS billing platform with Stripe integration. Supports multiple
pricing models, usage tracking, and automated invoicing.

## Capabilities

- **Subscription Plans**: Flat rate and tiered pricing
- **Usage-Based Billing**: Metered billing for consumption
- **Invoicing**: Automated invoice generation
- **Payment Methods**: Cards, bank transfers
- **Trials & Coupons**: Promotional features

## Usage

```markdown
@skill subscription-management

Set up subscription billing for my SaaS:

- Plans: Starter ($29/mo), Pro ($99/mo), Enterprise (custom)
- Features: Usage-based API calls
- Trial: 14 days free
```

## Database Schema

```typescript
// subscriptions table
{
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  stripeSubscriptionId: varchar('stripe_subscription_id'),
  status: varchar('status'), // active, canceled, past_due
  planName: varchar('plan_name'),
  price: decimal('price', { precision: 10, scale: 2 }),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
}
```

## API Endpoints

```typescript
// Create subscription
POST /api/subscriptions
{
  "priceId": "price_123",
  "paymentMethodId": "pm_456"
}

// Update subscription
PATCH /api/subscriptions/:id
{
  "priceId": "price_789"
}

// Cancel subscription
DELETE /api/subscriptions/:id
```

## Webhooks

Handle Stripe webhooks:

```typescript
// invoice.paid - Grant access
// invoice.payment_failed - Notify user
// customer.subscription.deleted - Revoke access
```

## Features

- **Proration**: Automatic proration on plan changes
- **Tax**: Tax calculation with TaxJar or Stripe Tax
- **Overages**: Handle usage overages
- **Dunning**: Failed payment recovery
- **Reporting**: MRR, churn, LTV metrics

## Integration

- Stripe Billing: Core subscription management
- Stripe Invoicing: Invoice generation
- Stripe Tax: Automatic tax calculation
- Webhooks: Real-time event handling
