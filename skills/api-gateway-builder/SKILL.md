---
name: api-gateway-builder
description:
  API Gateway setup with Kong or AWS API Gateway for routing, rate limiting,
  authentication, and request/response transformation. Use when building API
  gateways, managing microservice routing, implementing rate limiting, or
  setting up API authentication.
triggers:
  - 'API gateway'
  - 'Kong'
  - 'rate limiting'
  - 'routing'
  - 'API management'
---

# API Gateway Builder

Build API gateways with routing, rate limiting, authentication, and
transformation.

## Capabilities

- **Routing**: Path-based routing
- **Rate Limiting**: Prevent abuse
- **Authentication**: JWT, API keys
- **Transformation**: Request/response
- **Caching**: Reduce latency
- **Analytics**: API metrics

## Usage

```markdown
@skill api-gateway-builder

Set up an API gateway:

- Platform: Kong
- Services: Users API, Orders API
- Auth: JWT
- Rate limit: 1000 req/min
- Cache: 5 minutes
```

## Kong Configuration

```yaml
# kong.yml
_format_version: '3.0'

services:
  - name: users-service
    url: http://users:3000
    routes:
      - name: users-route
        paths:
          - /api/users
        strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 1000
      - name: jwt
      - name: proxy-cache
        config:
          cache_ttl: 300

  - name: orders-service
    url: http://orders:3000
    routes:
      - name: orders-route
        paths:
          - /api/orders
    plugins:
      - name: rate-limiting
        config:
          minute: 500
      - name: jwt
      - name: request-transformer
        config:
          add:
            headers:
              - X-Service:orders
```

## Rate Limiting

```typescript
// Rate limit by API key
const rateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,
  keyGenerator: req => req.headers['x-api-key'],
})

// Rate limit by user
const userRateLimit = new RateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: req => req.user.id,
})

app.use('/api/', rateLimit.middleware())
```

## Authentication

```typescript
// JWT validation
app.use(
  '/api/',
  jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
  })
)

// API key validation
app.use(
  '/api/',
  apiKeyAuth({
    header: 'x-api-key',
    validator: async key => {
      const client = await db.clients.findByApiKey(key)
      return client?.active === true
    },
  })
)
```

## Request Transformation

```typescript
// Add headers
app.use(
  transformRequest({
    addHeaders: {
      'X-Request-ID': () => uuid(),
      'X-Timestamp': () => Date.now().toString(),
    },
  })
)

// Modify path
app.use(
  transformPath({
    '/api/v1/*': '/$1',
    '/api/users/:id': '/users/$1',
  })
)
```

## Caching

```typescript
const cache = new APICache({
  store: 'redis',
  ttl: 300, // 5 minutes

  // Cache only GET requests
  keyGenerator: req => `cache:${req.method}:${req.url}`,

  // Skip cache for authenticated mutations
  skip: req => req.method !== 'GET' && req.user,
})

app.use(cache.middleware())
```

## Analytics

```typescript
// Track API usage
app.use(
  apiAnalytics({
    store: 'influxdb',

    metrics: {
      requestCount: true,
      latency: true,
      statusCodes: true,
      errors: true,
    },

    dimensions: {
      service: req => req.route.service,
      endpoint: req => req.route.path,
      client: req => req.user?.organizationId,
    },
  })
)
```

## Features

- **Load Balancing**: Round-robin, least-connections
- **Health Checks**: Automatic failover
- **SSL/TLS**: Termination, passthrough
- **WebSocket**: Proxy support
- **GraphQL**: Federation gateway
