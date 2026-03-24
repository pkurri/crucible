-- 📡 CRUCIBLE WORLD INTELLIGENCE SCHEMA
-- For tracking world events, market data, and agent intelligence.

CREATE TABLE IF NOT EXISTS public.world_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('market', 'news', 'tech', 'social')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime for Live HUD
ALTER PUBLICATION supabase_realtime ADD TABLE world_events;

-- Indexing for high-performance retrieval
CREATE INDEX IF NOT EXISTS idx_world_events_category ON public.world_events (category);
CREATE INDEX IF NOT EXISTS idx_world_events_created_at ON public.world_events (created_at DESC);

-- RLS Policies: Everyone can read, only Service Role can insert
ALTER TABLE public.world_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to world events"
ON public.world_events FOR SELECT USING (true);

-- Ensure forge_events also has Realtime enabled
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'forge_events') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE forge_events;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
