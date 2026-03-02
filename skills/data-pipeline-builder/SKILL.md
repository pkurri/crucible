---
name: data-pipeline-builder
description: ETL pipeline builder for data extraction, transformation, and loading with support for batch and streaming processing. Use when building data pipelines, setting up ETL jobs, processing large datasets, or creating data workflows.
triggers:
  - "ETL"
  - "data pipeline"
  - "data processing"
  - "batch job"
  - "data warehouse"
  - "Airflow"
---

# Data Pipeline Builder

ETL and ELT pipeline builder for data integration, transformation, and loading.

## Capabilities

- **Extraction**: Connect to any data source
- **Transformation**: Clean, validate, enrich
- **Loading**: Load to any destination
- **Scheduling**: Cron-based or event-driven
- **Monitoring**: Track pipeline health

## Usage

```markdown
@skill data-pipeline-builder

Build a data pipeline:
- Source: PostgreSQL (users table)
- Transform: Clean emails, validate data
- Destination: Snowflake (analytics.users)
- Schedule: Daily at 2 AM
```

## Pipeline Definition

```typescript
// pipeline.ts
import { Pipeline } from '@crucible/data';

const pipeline = new Pipeline({
  name: 'user-analytics',
  schedule: '0 2 * * *', // Daily at 2 AM
});

// Extract
pipeline.extract({
  source: 'postgresql',
  query: 'SELECT * FROM users WHERE updated_at > {{ last_run }}',
  connection: {
    host: 'db.example.com',
    database: 'production'
  }
});

// Transform
pipeline.transform({
  steps: [
    {
      name: 'clean-email',
      operation: 'lowercase',
      column: 'email'
    },
    {
      name: 'validate-phone',
      operation: 'regex',
      column: 'phone',
      pattern: '^\+?[1-9]\d{1,14}$'
    },
    {
      name: 'enrich',
      operation: 'lookup',
      column: 'country_code',
      lookup: {
        table: 'countries',
        key: 'code',
        values: ['name', 'region']
      }
    }
  ]
});

// Load
pipeline.load({
  destination: 'snowflake',
  table: 'analytics.users',
  mode: 'upsert',
  keys: ['id']
});

export default pipeline;
```

## Transform Operations

```typescript
// Filter
{ operation: 'filter', condition: 'age > 18' }

// Aggregate
{ 
  operation: 'aggregate',
  groupBy: ['country'],
  metrics: {
    user_count: 'count()',
    avg_age: 'avg(age)'
  }
}

// Join
{
  operation: 'join',
  type: 'left',
  table: 'orders',
  on: 'users.id = orders.user_id'
}

// Map
{
  operation: 'map',
  column: 'status',
  mapping: {
    '0': 'inactive',
    '1': 'active'
  }
}
```

## Monitoring

```typescript
// Track pipeline runs
pipeline.on('start', (context) => {
  console.log(`Pipeline ${context.name} started`);
});

pipeline.on('complete', (context) => {
  console.log(`Pipeline completed: ${context.rows} rows processed`);
});

pipeline.on('error', (error, context) => {
  console.error(`Pipeline failed: ${error.message}`);
});
```

## Features

- **Schema Evolution**: Handle changing schemas
- **Data Quality**: Validation rules
- **Incremental**: Delta processing
- **Backfill**: Historical data
- **Partitioning**: Big table optimization
- **CDC**: Change Data Capture

## Connectors

- **Sources**: PostgreSQL, MySQL, MongoDB, S3, Kafka
- **Destinations**: Snowflake, BigQuery, Redshift, S3
- **Transformations**: SQL, Python, dbt

## Integration

- Airflow: Orchestration
- dbt: Transformations
- Great Expectations: Data quality
- Slack: Notifications
