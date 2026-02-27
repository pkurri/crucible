---
name: resend
description: >
  Transactional email with Resend and React Email. Covers setup, templates,
  sending, webhooks, and best practices. Use whenever email is needed.
triggers:
  - "send email"
  - "transactional email"
  - "resend"
  - "email template"
---

# Service: Resend

Resend is the modern transactional email API. Pair it with React Email for type-safe, component-based email templates.

## Setup

```bash
pnpm add resend @react-email/components
```

```typescript
// src/lib/email.ts
import { Resend } from 'resend'
export const resend = new Resend(process.env.RESEND_API_KEY!)
```

## Email Templates with React Email

```tsx
// src/emails/welcome.tsx
import { Html, Head, Body, Container, Text, Button } from '@react-email/components'

interface WelcomeEmailProps {
  name: string
  loginUrl: string
}

export function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f5f5f5' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            Welcome, {name}!
          </Text>
          <Text>Your account is ready. Click below to get started.</Text>
          <Button
            href={loginUrl}
            style={{ background: '#000', color: '#fff', padding: '12px 20px', borderRadius: 4 }}
          >
            Get Started
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

## Sending Email

```typescript
// src/lib/send-email.ts
import { resend } from './email'
import { WelcomeEmail } from '@/emails/welcome'

export async function sendWelcomeEmail(to: string, name: string) {
  const { data, error } = await resend.emails.send({
    from: 'Your App <noreply@yourdomain.com>',
    to,
    subject: `Welcome to Your App, ${name}!`,
    react: WelcomeEmail({ name, loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` }),
  })

  if (error) throw new Error(`Failed to send email: ${error.message}`)
  return data
}
```

## Environment Variables

```
RESEND_API_KEY=re_xxxxxxxxxxxx
```

## Email Types to Implement

| Type | Trigger | Template |
|---|---|---|
| Welcome | User signup | WelcomeEmail |
| Magic Link | Passwordless login | MagicLinkEmail |
| Password Reset | Reset request | PasswordResetEmail |
| Invoice | Payment success | InvoiceEmail |
| Trial Ending | 3 days before expiry | TrialEndingEmail |

## Dev Preview

```bash
pnpm dlx email dev --dir src/emails
# Opens localhost:3000 with live email preview
```
