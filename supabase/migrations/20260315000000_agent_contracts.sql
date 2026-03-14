-- Supabase Migration: Agent Contracts (A2A Discovery)

CREATE TABLE IF NOT EXISTS public.agent_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_agent VARCHAR(255) NOT NULL,
    requester_agent VARCHAR(255) NOT NULL,
    task_description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, active, completed, failed
    reward_karma INTEGER DEFAULT 0,
    result_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.agent_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their own contracts"
    ON public.agent_contracts
    FOR SELECT
    USING (true); -- Public for transparent A2A market

CREATE POLICY "Agents can create contracts"
    ON public.agent_contracts
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Provider agents can update standard contracts"
    ON public.agent_contracts
    FOR UPDATE
    USING (true);
