---
name: real-time-analytics
description: Real-time event processing and analytics platform with streaming data pipelines. Use when building analytics dashboards, processing event streams, monitoring KPIs, or analyzing user behavior in real-time.
triggers:
  - "real-time analytics"
  - "event streaming"
  - "analytics dashboard"
  - "metrics"
  - "KPI"
  - "monitoring"
---

# Real-Time Analytics Engine

Stream processing platform for real-time event analytics, metrics aggregation, and live dashboards.

## Capabilities

- **Event Ingestion**: High-throughput event streaming
- **Stream Processing**: Real-time data transformation
- **Metrics Aggregation**: Live KPI calculation
- **Dashboard**: Real-time visualization
- **Alerting**: Anomaly detection and alerts

## Architecture

```
Events → Kafka → Processors → ClickHouse → Dashboard
                ↓
           Redis (cache)
```

## Usage

```markdown
@skill real-time-analytics

Set up analytics for my SaaS:
- Events: page_views, signups, payments
- Retention cohorts
- Real-time revenue dashboard
```

## Event Schema

```typescript
interface AnalyticsEvent {
  event_id: string;
  event_type: 'page_view' | 'click' | 'purchase';
  user_id: string;
  timestamp: Date;
  properties: Record<string, any>;
  context: {
    url: string;
    referrer: string;
    device: string;
  };
}
```

## Processing Pipeline

```typescript
// 1. Ingest events
await kafka.produce('events', event);

// 2. Process stream
stream.process({
  groupBy: ['user_id'],
  window: '1 minute',
  aggregations: {
    count: 'count()',
    revenue: 'sum(amount)'
  }
});

// 3. Store metrics
await clickhouse.insert('metrics', {
  timestamp: Date.now(),
  metric_name: 'active_users',
  value: 1500
});
```

## Dashboard Widgets

- **Real-time Users**: Live active user count
- **Event Stream**: Recent events feed
- **Cohort Retention**: User retention curves
- **Funnel Analysis**: Conversion steps
- **Geographic Map**: User distribution

## SQL Queries

```sql
-- Daily active users
SELECT 
  toDate(timestamp) as date,
  uniqExact(user_id) as dau
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY
GROUP BY date
ORDER BY date;

-- Real-time events per second
SELECT 
  toStartOfInterval(timestamp, INTERVAL 1 SECOND) as second,
  count() as events
FROM events
WHERE timestamp >= now() - INTERVAL 5 MINUTE
GROUP BY second
ORDER BY second;
```

## Integration

- Kafka: Event streaming
- ClickHouse: Analytics database
- Redis: Real-time aggregations
- WebSocket: Live dashboard updates
- Grafana: Visualization (optional)
