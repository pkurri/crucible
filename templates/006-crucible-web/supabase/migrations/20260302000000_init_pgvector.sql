-- Enable pgvector extension
create extension if not exists vector
with
  schema extensions;

-- Create table for storing market research and UI trends
create table market_research (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  component_type text not null, -- e.g., 'hero', 'navbar', 'card'
  aesthetic_tags text[] not null, -- e.g., ['glassmorphism', 'voxyz-style', 'glow']
  content text not null,
  embedding vector(1536), -- OpenAI embedding size
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a specialized function to match similar designs based on vector distance
create or replace function match_designs (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  source_url text,
  component_type text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    market_research.id,
    market_research.source_url,
    market_research.component_type,
    market_research.content,
    1 - (market_research.embedding <=> query_embedding) as similarity
  from market_research
  where 1 - (market_research.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
