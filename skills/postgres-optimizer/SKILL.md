---
name: postgres-optimizer
description: >
  Expert PostgreSQL optimization: slow query diagnosis, index strategy, pgvector
  for semantic search (HNSW/IVFFlat), connection pooling, vacuum tuning.
  Use when debugging slow queries, setting up vector search, or scaling a Postgres DB.
triggers:
  - "postgres"
  - "postgresql"
  - "slow query"
  - "database performance"
  - "pgvector"
  - "vector search"
  - "semantic search"
  - "database index"
  - "query optimization"
---

# Skill: Postgres Optimizer

Diagnose and fix PostgreSQL performance issues. Specializes in pgvector for semantic search.

---

## Diagnostic Tools

### 1. Find Slow Queries (pg_stat_statements)

```sql
-- Enable extension first (run once)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find the 10 slowest queries
SELECT
  query,
  calls,
  round(total_exec_time::numeric, 2) AS total_ms,
  round(mean_exec_time::numeric, 2) AS avg_ms,
  round((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) AS pct
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### 2. EXPLAIN ANALYZE — Always Run on Suspect Queries

```sql
-- Get full execution plan with buffers
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM users WHERE email = 'test@example.com';

-- What to look for:
-- ✅ Index Scan  — good, uses index
-- ❌ Seq Scan    — bad on large tables, needs index
-- ❌ Hash Join on large tables — may need index on join column
-- ❌ Rows=1000 but Actual Rows=50000 — stale statistics, run ANALYZE
```

### 3. Check Active Connections

```sql
SELECT
  pid,
  usename,
  application_name,
  state,
  wait_event_type,
  wait_event,
  query_start,
  query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;
```

---

## Index Strategy

```sql
-- Standard index on frequently-queried column
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Composite index for common query pattern
CREATE INDEX CONCURRENTLY idx_posts_user_created
  ON posts(user_id, created_at DESC);

-- Partial index — only index active records
CREATE INDEX CONCURRENTLY idx_users_active_email
  ON users(email) WHERE deleted_at IS NULL;

-- CONCURRENTLY = no table lock (safe for production)
```

**Rules:**
- Always index foreign keys
- Index columns used in WHERE, ORDER BY, JOIN
- Use `CONCURRENTLY` in production to avoid locking
- Check index usage: `SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan`

---

## pgvector — Semantic Search

### Setup

```sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE documents ADD COLUMN embedding vector(1536);  -- OpenAI ada-002 dimensions
```

### HNSW Index (Recommended — Best Performance/Recall)

```sql
-- Create HNSW index
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Tune at query time for recall vs speed
SET hnsw.ef_search = 100;  -- Higher = better recall, slower

-- Similarity search
SELECT id, content, 1 - (embedding <=> '[...vector...]') AS similarity
FROM documents
ORDER BY embedding <=> '[...vector...]'
LIMIT 10;
```

### IVFFlat Index (Alternative — Lower Memory)

```sql
-- Rule: lists ≈ sqrt(total_rows)
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Must set probes for recall (higher = better recall)
SET ivfflat.probes = 10;
```

### Hybrid Search (Vector + Keyword)

```sql
-- Combine vector similarity with full-text search
SELECT
  d.id,
  d.content,
  (1 - (d.embedding <=> query_embedding)) * 0.7 +
  ts_rank(d.search_vector, query_tsquery) * 0.3 AS score
FROM documents d,
  to_tsquery('english', 'search terms') query_tsquery,
  '[...vector...]' :: vector query_embedding
WHERE d.search_vector @@ query_tsquery
   OR (d.embedding <=> query_embedding) < 0.3
ORDER BY score DESC
LIMIT 10;
```

---

## Connection Pooling (Neon / PgBouncer)

```
# Neon — use connection pooler URL for serverless
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# PgBouncer settings for high concurrency
pool_mode = transaction       # Best for serverless
max_client_conn = 1000
default_pool_size = 25
```

---

## Maintenance

```sql
-- Check table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.' ||tablename)) AS total_size,
  n_dead_tup AS dead_rows
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- Manual vacuum if autovacuum is behind
VACUUM ANALYZE users;

-- Check autovacuum is running
SELECT schemaname, tablename, last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY last_autovacuum NULLS FIRST;
```
