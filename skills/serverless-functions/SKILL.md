---
name: serverless-functions
description: Serverless functions platform with AWS Lambda, Vercel Functions, and Cloudflare Workers support. Use when building serverless applications, deploying edge functions, creating API endpoints, or implementing event-driven compute.
triggers:
  - "serverless"
  - "Lambda"
  - "Cloudflare Workers"
  - "Vercel Functions"
  - "edge functions"
  - "FaaS"
---

# Serverless Functions Platform

Build and deploy serverless functions across multiple providers: AWS Lambda, Vercel, Cloudflare Workers.

## Capabilities

- **Multi-Provider**: AWS, Vercel, Cloudflare
- **HTTP Functions**: API endpoints
- **Event Functions**: S3, SQS, EventBridge
- **Scheduled**: Cron jobs
- **Edge**: Global deployment

## Usage

```markdown
@skill serverless-functions

Create a serverless function:
- Provider: Vercel
- Type: API endpoint
- Route: /api/webhook
- Runtime: Node.js 18
```

## Vercel Functions

```typescript
// api/webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event, data } = req.body;
  
  // Process webhook
  await processWebhook(event, data);
  
  return res.status(200).json({ received: true });
}

// Config
export const config = {
  runtime: 'nodejs18.x',
  maxDuration: 30
};
```

## Cloudflare Workers

```typescript
// src/index.ts
export interface Env {
  DATABASE_URL: string;
  API_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/users') {
      const users = await getUsers(env.DATABASE_URL);
      return Response.json(users);
    }
    
    return new Response('Not found', { status: 404 });
  }
};
```

## AWS Lambda

```typescript
// functions/process-order/index.ts
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const order = JSON.parse(event.body);
  
  // Process order
  await processOrder(order);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'Order processed',
      orderId: order.id 
    })
  };
};
```

## Event-Driven Functions

```typescript
// S3 Event Handler
export const handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;
    
    // Process uploaded file
    await processFile(bucket, key);
  }
};

// SQS Handler
export const handler = async (event: SQSEvent) => {
  for (const message of event.Records) {
    const data = JSON.parse(message.body);
    
    // Process message
    await processMessage(data);
  }
};

// Scheduled (Cron)
export const handler = async () => {
  // Run daily cleanup
  await cleanupOldData();
};
```

## Local Development

```bash
# Vercel
vercel dev

# Cloudflare
wrangler dev

# AWS
serverless offline
```

## Deployment

```bash
# Vercel
vercel --prod

# Cloudflare
wrangler deploy

# AWS
serverless deploy
```

## Features

- **Environment Variables**: Secure secrets
- **Logs**: CloudWatch, Vercel, Wrangler
- **Monitoring**: Built-in metrics
- **Cold Start**: Minimize latency
- **Concurrency**: Auto-scaling

## Best Practices

1. **Keep Functions Small**: Single purpose
2. **Use Connection Pooling**: Reuse DB connections
3. **Minimize Dependencies**: Faster cold starts
4. **Error Handling**: Graceful failures
5. **Timeouts**: Set appropriate limits
