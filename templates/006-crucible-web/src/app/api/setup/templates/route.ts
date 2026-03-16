import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();

  const ENTERPRISE_TEMPLATES = [
    {
      template_id: 'enterprise-safe-saas',
      name: 'Safe-SaaS Architect',
      category: 'Security',
      description: 'Enterprise-grade blueprint for building HIPAA/GDPR-compliant SaaS platforms with integrated Sentinel safety gates and PII scrubbing.',
      icon: 'ShieldCheck',
      tier: 'Enterprise',
      complexity: 'High',
      estimated_setup: '15 minutes',
      included_agents: ['Sentinel', 'PIIScrubber', 'CircuitBreaker'],
      capabilities: ['Compliance Logging', 'PII Redaction', 'Autonomous Cost Control'],
      integrations: ['AWS Nitro Enclaves', 'Supabase Auth', 'Stripe Tax'],
    },
    {
      template_id: 'enterprise-market-nexus',
      name: 'Market Intelligence Nexus',
      category: 'Intelligence',
      description: 'Advanced market telemetry engine that performs deep-dive competitor audits, pricing extraction, and autonomous ROI forecasting.',
      icon: 'BarChart3',
      tier: 'Enterprise',
      complexity: 'High',
      estimated_setup: '10 minutes',
      included_agents: ['MarketAnalyst', 'RevenueOptimizer', 'Auditor'],
      capabilities: ['Competitor Price Scraping', 'Viral Sentiment Analysis', 'ROI Simulation'],
      integrations: ['Clearbit API', 'Twitter/X API', 'Crunchbase'],
    },
    {
      template_id: 'sovereign-ai-forge',
      name: 'Sovereign AI Forge',
      category: 'DevOps',
      description: 'Government-grade autonomous development pipeline with Sovereign logic audits and air-gapped deployment compatibility.',
      icon: 'Lock',
      tier: 'Sovereign',
      complexity: 'High',
      estimated_setup: '20 minutes',
      included_agents: ['LogicScrutineer', 'SecurityGuardian', 'ForgeOverseer'],
      capabilities: ['Air-gapped Sync', 'Logic Verification', 'Supply Chain Security'],
      integrations: ['GitHub Enterprise', 'Private Docker Registry', 'HashiCorp Vault'],
    }
  ];

  const { data, error } = await supabase
    .from('forge_templates')
    .upsert(ENTERPRISE_TEMPLATES.map(t => ({ ...t, status: 'active' })), { onConflict: 'template_id' })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, seeded: data?.length || 0, templates: data });
}
