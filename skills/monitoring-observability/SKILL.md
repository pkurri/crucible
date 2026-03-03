---
name: monitoring-observability
description:
  Application monitoring and observability with metrics, logs, traces, and
  alerting. Use when setting up monitoring, configuring observability,
  implementing distributed tracing, or setting up alerts.
triggers:
  - 'monitoring'
  - 'observability'
  - 'metrics'
  - 'logging'
  - 'tracing'
  - 'alerts'
  - 'Prometheus'
---

# Monitoring & Observability

Complete observability stack with metrics, logs, traces, and alerting.

## Capabilities

- **Metrics**: Prometheus, custom metrics
- **Logging**: Structured logging, aggregation
- **Tracing**: Distributed tracing with OpenTelemetry
- **Alerting**: Multi-channel notifications
- **Dashboards**: Real-time visualization

## Usage

```markdown
@skill monitoring-observability

Set up monitoring for my application:

- Metrics: request duration, error rates
- Logs: structured JSON
- Traces: OpenTelemetry
- Alerts: PagerDuty
```

## Metrics

```typescript
import {metrics} from '@crucible/observability'

// Counter
const requestCounter = metrics.counter('http_requests_total', {
  labels: ['method', 'status'],
})

requestCounter.inc({method: 'GET', status: '200'})

// Histogram
const requestDuration = metrics.histogram('http_request_duration_seconds', {
  buckets: [0.1, 0.5, 1, 2, 5],
})

requestDuration.observe(0.45)

// Gauge
const activeConnections = metrics.gauge('active_connections')

activeConnections.set(150)
```

## Logging

```typescript
import {logger} from '@crucible/observability'

// Structured logging
logger.info('User login', {
  userId: '123',
  method: 'oauth',
  duration: 245,
})

logger.error('Database connection failed', {
  error: err.message,
  retryCount: 3,
})
```

## Tracing

```typescript
import {trace} from '@opentelemetry/api'

const tracer = trace.getTracer('my-app')

async function processOrder(orderId: string) {
  const span = tracer.startSpan('processOrder')

  try {
    span.setAttribute('order.id', orderId)

    const payment = await processPayment(orderId)
    span.addEvent('payment-processed')

    const fulfillment = await createFulfillment(orderId)
    span.addEvent('fulfillment-created')

    return {payment, fulfillment}
  } catch (error) {
    span.recordException(error)
    throw error
  } finally {
    span.end()
  }
}
```

## Alerting Rules

```yaml
# alerts.yaml
groups:
  - name: api-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'High error rate detected'

      - alert: SlowRequests
        expr:
          histogram_quantile(0.95,
          rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: 'Slow API responses'
```

## Integration

- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Jaeger**: Distributed tracing
- **ELK**: Log aggregation
- **PagerDuty**: Alerting
- **Slack**: Notifications
