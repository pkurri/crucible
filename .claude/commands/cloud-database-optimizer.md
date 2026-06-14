---
name: cloud-database-optimizer
description:
  Cloud database optimization and management for PostgreSQL, MySQL, and NoSQL
  databases with automated tuning, scaling, and monitoring. Use when optimizing
  database performance, managing cloud databases, implementing sharding, or
  setting up replication.
triggers:
  - 'database optimization'
  - 'PostgreSQL'
  - 'MySQL'
  - 'Neon'
  - 'Supabase'
  - 'PlanetScale'
  - 'database scaling'
---

# Cloud Database Optimizer

Optimize and manage cloud databases with automated tuning and scaling.

## Capabilities

- **Query Optimization**: Index recommendations
- **Connection Pooling**: PgBouncer, ProxySQL
- **Auto-Scaling**: Read replicas
- **Monitoring**: Slow query logs
- **Backup**: Automated backups

## Usage

```markdown
@skill cloud-database-optimizer

Optimize my PostgreSQL database:

- Provider: Neon
- Issues: Slow queries, connection limits
- Goal: Improve performance by 50%
```

## Query Optimization

```typescript
// Analyze slow queries
const analysis = await analyzeQueries({
  connectionString: process.env.DATABASE_URL,
  minDuration: 100, // ms
  limit: 50,
})

// Recommend indexes
const recommendations = analysis.map(query => ({
  query: query.sql,
  duration: query.avgTime,
  index: suggestIndex(query.sql),
  impact: calculateImpact(query),
}))
```

## Connection Pooling

```typescript
// PgBouncer configuration
const pooler = new ConnectionPooler({
  maxConnections: 20,
  minConnections: 5,
  idleTimeout: 30000,

  // Pool modes
  mode: 'transaction', // session, transaction, statement

  // Server settings
  server: {
    host: 'db.example.com',
    port: 5432,
    database: 'app',
  },
})
```

## Read Replicas

```typescript
// Configure read replicas
const cluster = new DatabaseCluster({
  primary: {
    host: 'primary.db.example.com',
    write: true,
  },
  replicas: [
    {host: 'replica-1.db.example.com', region: 'us-east'},
    {host: 'replica-2.db.example.com', region: 'us-west'},
  ],

  routing: {
    reads: 'nearest-replica',
    writes: 'primary',
  },
})

// Route queries
const db = cluster.getConnection({
  operation: 'read',
  region: 'us-east',
})
```

## Performance Monitoring

```typescript
// Track database metrics
const metrics = new DatabaseMetrics({
  connectionString: process.env.DATABASE_URL,
})

// Alert on issues
metrics.on('slowQuery', query => {
  if (query.duration > 1000) {
    alert(`Slow query detected: ${query.sql}`)
  }
})

metrics.on('highConnections', count => {
  if (count > 80) {
    scaleUpConnections()
  }
})
```

## Automated Backups

```typescript
// Configure backups
const backup = new DatabaseBackup({
  schedule: '0 2 * * *', // Daily at 2 AM
  retention: 30, // Keep 30 days
  compression: true,
  encryption: 'AES256',

  // Destination
  destination: {
    type: 's3',
    bucket: 'db-backups',
    prefix: 'production/',
  },
})

// Restore
await backup.restore({
  timestamp: '2024-01-15T02:00:00Z',
  target: 'new-database',
})
```

## Features

- **Sharding**: Horizontal partitioning
- **Partitioning**: Time-based tables
- **Vacuum**: Automated cleanup
- **Updates**: Zero-downtime migrations
- **SSL**: Encrypted connections

## Best Practices

1. **Indexing**: Covering indexes for common queries
2. **Connection Limits**: Match pool size to instance
3. **Query Caching**: Cache frequent reads
4. **Monitoring**: Track active connections
5. **Disaster Recovery**: Cross-region replicas
