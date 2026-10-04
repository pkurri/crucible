-- 🏢 LINKEDIN MULTI-TENANT AUTOMATION
-- Companies (tenants), encrypted per-company credentials, voice profiles,
-- recurring-job schedules, the human-in-the-loop draft-approval inbox, and a
-- job-run audit trail. See /Users/aak/.claude/plans/can-we-make-this-snappy-adleman.md
-- for the full design (skill invocation, worker, billing, UI).

-- Tenant / company
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_tier TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'pending_setup'
    CHECK (status IN ('pending_setup', 'active', 'paused', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Membership (v1 has just the owner; future-proofs multi-user-per-company)
CREATE TABLE IF NOT EXISTS public.company_members (
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'editor', 'approver')),
  PRIMARY KEY (company_id, user_id)
);

-- Encrypted per-company credentials (Publora is one account per company)
CREATE TABLE IF NOT EXISTS public.company_credentials (
  company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  publora_api_key_enc TEXT,
  publora_api_key_iv TEXT,
  publora_api_key_tag TEXT,
  linkedin_platform_id TEXT, -- Publora's platformId; not secret, stored plain
  apify_token_enc TEXT,
  apify_token_iv TEXT,
  apify_token_tag TEXT,
  pixfaro_token_enc TEXT,
  pixfaro_token_iv TEXT,
  pixfaro_token_tag TEXT,
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Voice profile (per-company replacement for the shared voice-profile.md template)
CREATE TABLE IF NOT EXISTS public.company_voice_profiles (
  company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  filled BOOLEAN DEFAULT false,
  voice_fingerprint TEXT,
  icp TEXT,
  hard_rules TEXT,
  cta_style TEXT,
  brand_handle TEXT,
  brand_color TEXT,
  brand_logo_url TEXT,
  sample_posts JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Per-company automation cadence
CREATE TABLE IF NOT EXISTS public.company_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL
    CHECK (job_type IN ('weekly_content_batch', 'daily_comment_check', 'thread_monitor')),
  cron_pattern TEXT NOT NULL,
  pillar_mix JSONB,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Draft approval inbox (the human-in-the-loop gate for headless runs)
CREATE TABLE IF NOT EXISTS public.content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('post', 'comment', 'reply', 'reshare', 'reaction')),
  preview_text TEXT NOT NULL,
  target_url TEXT,
  extra_context JSONB,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'published', 'failed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  publish_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Job execution audit trail (per-tenant cost/latency tracking)
CREATE TABLE IF NOT EXISTS public.skill_job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  job_type TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
  bullmq_job_id TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  tokens_used INTEGER,
  cost_usd NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_company_members_user ON public.company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_schedules_company ON public.company_schedules(company_id) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_content_drafts_pending ON public.content_drafts(company_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_skill_job_runs_company ON public.skill_job_runs(company_id, started_at DESC);

-- Row Level Security -------------------------------------------------------

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_job_runs ENABLE ROW LEVEL SECURITY;

-- A member of a company can see/manage rows scoped to that company.
CREATE POLICY "Members can view their companies"
ON public.companies FOR SELECT
USING (id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Owners can update their company"
ON public.companies FOR UPDATE
USING (id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND role = 'owner'));

CREATE POLICY "Members can view their own membership rows"
ON public.company_members FOR SELECT
USING (user_id = auth.uid());

-- company_credentials: NO row is selectable by anon/authenticated, ever.
-- Decryption happens server-side (service_role) only, per the plan's threat
-- model — a leaked JWT must never be enough to read another company's, or
-- even the user's own, encrypted secrets directly.
CREATE POLICY "No direct client access to credentials"
ON public.company_credentials FOR ALL
USING (false);

CREATE POLICY "Members can view their voice profile"
ON public.company_voice_profiles FOR SELECT
USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Editors can update their voice profile"
ON public.company_voice_profiles FOR UPDATE
USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')));

CREATE POLICY "Members can view their schedules"
ON public.company_schedules FOR SELECT
USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Editors can manage their schedules"
ON public.company_schedules FOR ALL
USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')));

CREATE POLICY "Members can view their drafts"
ON public.content_drafts FOR SELECT
USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Approvers can update draft status"
ON public.content_drafts FOR UPDATE
USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid() AND role IN ('owner', 'approver')));

CREATE POLICY "Members can view their job runs"
ON public.skill_job_runs FOR SELECT
USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));
