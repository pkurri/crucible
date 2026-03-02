-- Create table for streaming live telemetry events from the Autonomous Forge
create table forge_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null, -- e.g., 'GATHER', 'ANALYZE', 'STORE', 'FORGE', 'ERROR'
  message text not null,
  agent_id text not null default 'autonomous_worker',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Realtime for the forge_events table so the Next.js UI can subscribe to it
alter publication supabase_realtime add table forge_events;

-- Allow public read access (for the UI dashboard)
alter table forge_events enable row level security;
create policy "Allow public read access to forge_events"
  on forge_events for select
  using (true);

-- Allow authenticated service role (the worker) to insert
create policy "Allow service role insert"
  on forge_events for insert
  with check (true);
