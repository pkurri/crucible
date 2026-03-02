---
name: notification-system-builder
description: Multi-channel notification system with email, SMS, push, and in-app notifications with preference management and delivery tracking. Use when building notification systems, sending transactional emails, implementing push notifications, or managing user preferences.
triggers:
  - "notifications"
  - "email"
  - "SMS"
  - "push notifications"
  - "Resend"
  - "Twilio"
  - "FCM"
---

# Notification System Builder

Multi-channel notification system with email, SMS, push, and in-app notifications.

## Capabilities

- **Multi-Channel**: Email, SMS, Push, In-App
- **Templates**: Dynamic content
- **Preferences**: User controls
- **Scheduling**: Delayed delivery
- **Tracking**: Delivery status

## Usage

```markdown
@skill notification-system-builder

Set up notifications:
- Channels: Email, Push
- Providers: Resend, FCM
- Templates: Welcome, Order confirmation
- Preferences: Granular controls
```

## Notification Service

```typescript
import { NotificationService } from '@crucible/notifications';

const service = new NotificationService({
  providers: {
    email: new ResendProvider({ apiKey: process.env.RESEND_KEY }),
    sms: new TwilioProvider({
      accountSid: process.env.TWILIO_SID,
      authToken: process.env.TWILIO_TOKEN
    }),
    push: new FCMProvider({
      serviceAccount: process.env.FCM_SERVICE_ACCOUNT
    })
  }
});

// Send notification
await service.send({
  userId: 'user-123',
  channels: ['email', 'push'],
  template: 'order-confirmation',
  data: {
    orderId: 'ORD-456',
    items: [...],
    total: 99.99
  }
});
```

## Templates

```typescript
// Email template
const orderConfirmationEmail = {
  id: 'order-confirmation',
  subject: 'Order {{orderId}} Confirmed',
  body: `
    <h1>Thank you for your order!</h1>
    <p>Order ID: {{orderId}}</p>
    <ul>
      {{#each items}}
        <li>{{name}} - ${{price}}</li>
      {{/each}}
    </ul>
    <p>Total: ${{total}}</p>
  `,
  text: 'Thank you! Order {{orderId}} confirmed. Total: ${{total}}'
};

// Push notification template
const orderConfirmationPush = {
  id: 'order-confirmation',
  title: 'Order Confirmed',
  body: 'Order {{orderId}} has been confirmed. Total: ${{total}}',
  data: {
    orderId: '{{orderId}}',
    screen: 'order-details'
  }
};
```

## User Preferences

```typescript
// Preference management
const preferences = {
  userId: 'user-123',
  channels: {
    email: {
      enabled: true,
      address: 'user@example.com',
      categories: {
        marketing: false,
        transactional: true,
        updates: true
      }
    },
    sms: {
      enabled: true,
      phone: '+1234567890',
      categories: {
        marketing: false,
        urgent: true
      }
    },
    push: {
      enabled: true,
      tokens: ['fcm-token-1'],
      categories: {
        all: true
      }
    }
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'America/New_York'
  }
};
```

## Batch Notifications

```typescript
// Send to multiple users
await service.sendBatch({
  template: 'weekly-newsletter',
  recipients: [
    { userId: 'user-1', data: { name: 'John' } },
    { userId: 'user-2', data: { name: 'Jane' } }
  ],
  
  // Rate limiting
  rateLimit: {
    maxPerSecond: 100,
    maxPerMinute: 1000
  }
});
```

## Delivery Tracking

```typescript
// Track notification status
const tracking = await service.track('notification-123');

// Returns:
{
  id: 'notification-123',
  status: 'delivered',
  channels: {
    email: {
      status: 'delivered',
      provider: 'resend',
      messageId: 'msg_abc123',
      deliveredAt: '2024-01-15T10:30:00Z',
      openedAt: '2024-01-15T10:35:00Z'
    },
    push: {
      status: 'delivered',
      provider: 'fcm',
      deliveredAt: '2024-01-15T10:30:02Z'
    }
  }
}
```

## Features

- **Retry Logic**: Failed delivery retry
- **Throttling**: Rate limiting
- **A/B Testing**: Template variants
- **Analytics**: Open rates, clicks
- **Unsubscribe**: One-click unsubscribe

## Integration

- Resend: Email delivery
- Twilio: SMS
- FCM: Push notifications
- Slack: Team notifications
- PagerDuty: Incident alerts
