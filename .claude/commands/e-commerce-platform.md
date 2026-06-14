---
name: e-commerce-platform
description:
  Full-featured e-commerce platform with product catalog, shopping cart,
  checkout, payments, and order management. Use when building online stores,
  marketplaces, or any commerce functionality.
triggers:
  - 'e-commerce'
  - 'online store'
  - 'shopping cart'
  - 'checkout'
  - 'product catalog'
  - 'marketplace'
---

# E-commerce Platform

Complete e-commerce solution with product management, shopping cart, Stripe
payments, and order fulfillment.

## Capabilities

- **Product Catalog**: Categories, variants, inventory
- **Shopping Cart**: Persistent cart, abandoned cart recovery
- **Checkout**: Multi-step checkout, guest checkout
- **Payments**: Stripe integration, multiple methods
- **Orders**: Order tracking, fulfillment
- **Admin**: Dashboard, analytics

## Usage

```markdown
@skill e-commerce-platform

Build an e-commerce store:

- Products: Clothing, accessories
- Payment: Stripe
- Shipping: USPS, FedEx
- Tax: Automatic calculation
```

## Database Schema

```typescript
// Products
{
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  slug: varchar('slug', { length: 255 }).unique(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }),
  compareAtPrice: decimal('compare_at_price'),
  inventory: integer('inventory').default(0),
  images: jsonb('images'),
  variants: jsonb('variants'),
  categories: jsonb('categories'),
}

// Orders
{
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  status: varchar('status'), // pending, paid, shipped
  total: decimal('total', { precision: 10, scale: 2 }),
  items: jsonb('items'),
  shipping: jsonb('shipping'),
  payment: jsonb('payment'),
}
```

## Features

- **Product Variants**: Size, color options
- **Inventory**: Stock tracking
- **Discounts**: Coupons, sales
- **Shipping**: Multiple carriers
- **Tax**: TaxJar integration
- **Reviews**: Product ratings
- **Wishlist**: Save for later

## Checkout Flow

```typescript
// 1. Cart validation
const cart = await validateCart(cartId)

// 2. Create Stripe PaymentIntent
const paymentIntent = await stripe.paymentIntents.create({
  amount: cart.total * 100,
  currency: 'usd',
  automatic_payment_methods: {enabled: true},
})

// 3. Create order
const order = await createOrder({
  userId,
  items: cart.items,
  total: cart.total,
  paymentIntentId: paymentIntent.id,
})

// 4. Confirm payment (webhook)
await updateOrderStatus(order.id, 'paid')
```

## Integration

- Stripe: Payments
- TaxJar: Tax calculation
- ShipStation: Shipping labels
- SendGrid: Order emails
- Algolia: Product search
