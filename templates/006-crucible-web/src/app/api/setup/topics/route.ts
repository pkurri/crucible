import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// One-time setup: creates the ai_domain_topics table and seeds it
export async function GET() {
  const supabase = getSupabaseAdmin();

  // Step 1: Create table via raw SQL using supabase rpc
  const createSQL = `
    CREATE TABLE IF NOT EXISTS ai_domain_topics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      domain TEXT NOT NULL,
      topic TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      times_used INTEGER DEFAULT 0,
      last_used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
    );
  `;

  // Try using the rpc approach
  const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createSQL });
  
  if (rpcError) {
    // rpc may not exist — try inserting directly (table may already exist)
    console.log('RPC not available, attempting direct insert...');
  }

  // Step 2: Seed topics
  const TOPICS = [
    { domain: 'Healthcare', topic: 'How AI is Revolutionizing Drug Discovery and Clinical Trials' },
    { domain: 'Healthcare', topic: 'AI-Powered Diagnostics: From Medical Imaging to Early Disease Detection' },
    { domain: 'Healthcare', topic: 'The Role of Large Language Models in Personalized Medicine' },
    { domain: 'Finance', topic: 'AI-Driven Algorithmic Trading: Strategies and Risk Management' },
    { domain: 'Finance', topic: 'Fraud Detection at Scale Using Machine Learning Pipelines' },
    { domain: 'Finance', topic: 'How AI is Reshaping Insurance Underwriting and Claims Processing' },
    { domain: 'Education', topic: 'Adaptive Learning Platforms: How AI Personalizes Education at Scale' },
    { domain: 'Education', topic: 'AI Tutoring Systems That Outperform Traditional Classroom Methods' },
    { domain: 'Education', topic: 'Using Generative AI to Create Interactive STEM Curricula' },
    { domain: 'Manufacturing', topic: 'Predictive Maintenance with AI: Reducing Downtime by 80%' },
    { domain: 'Manufacturing', topic: 'Computer Vision in Quality Control for Smart Factories' },
    { domain: 'Manufacturing', topic: 'Digital Twins and AI Simulation in Modern Manufacturing' },
    { domain: 'Cybersecurity', topic: 'AI-Powered Threat Detection: Beyond Traditional SIEM Systems' },
    { domain: 'Cybersecurity', topic: 'Using Generative AI for Automated Penetration Testing' },
    { domain: 'Cybersecurity', topic: 'Zero-Trust Architecture Enhanced by Machine Learning Models' },
    { domain: 'Legal', topic: 'AI Contract Analysis: How NLP is Transforming Legal Review' },
    { domain: 'Legal', topic: 'Predictive Analytics in Litigation: AI-Powered Case Outcome Modeling' },
    { domain: 'Agriculture', topic: 'Precision Agriculture: How AI Drones and Satellites Optimize Crop Yields' },
    { domain: 'Agriculture', topic: 'AI-Driven Supply Chain Optimization for Global Food Systems' },
    { domain: 'Energy', topic: 'AI-Optimized Smart Grids: Balancing Renewable Energy at Scale' },
    { domain: 'Energy', topic: 'Predictive Modeling for Oil and Gas Exploration with Deep Learning' },
    { domain: 'Retail', topic: 'Hyper-Personalization: How AI is Driving 40% Higher Conversion Rates' },
    { domain: 'Retail', topic: 'AI-Powered Visual Search and Product Discovery in E-Commerce' },
    { domain: 'Transportation', topic: 'Autonomous Vehicles in 2026: The State of Self-Driving AI Systems' },
    { domain: 'Transportation', topic: 'AI Route Optimization for Last-Mile Delivery Logistics' },
    { domain: 'Software Engineering', topic: 'Building Multi-Agent Systems That Actually Ship Production Code' },
    { domain: 'Software Engineering', topic: 'The Rise of Agentic AI in Software Engineering Workflows' },
    { domain: 'Software Engineering', topic: 'AI Code Review: How LLMs Catch Bugs Before They Reach Production' },
    { domain: 'Software Engineering', topic: 'Autonomous CI/CD Pipelines Managed Entirely by AI Agents' },
    { domain: 'Real Estate', topic: 'AI-Powered Property Valuation and Market Prediction Models' },
    { domain: 'Real Estate', topic: 'How Computer Vision is Automating Building Inspections' },
    { domain: 'HR & Recruiting', topic: 'AI Resume Screening That Reduces Bias in Hiring' },
    { domain: 'HR & Recruiting', topic: 'Predictive Workforce Analytics: Reducing Employee Turnover with ML' },
    { domain: 'Media & Entertainment', topic: 'Generative AI in Film Production: From Script to Screen' },
    { domain: 'Media & Entertainment', topic: 'AI Music Composition and the Future of Creative Industries' },
    { domain: 'Climate & Environment', topic: 'AI-Driven Climate Modeling for Carbon Reduction Strategies' },
    { domain: 'Climate & Environment', topic: 'Using Satellite AI to Monitor Deforestation in Real-Time' },
  ];

  const { data, error } = await supabase
    .from('ai_domain_topics')
    .insert(TOPICS.map(t => ({ ...t, is_active: true, times_used: 0 })))
    .select();

  if (error) {
    return NextResponse.json({ 
      error: error.message,
      action_needed: 'Run this SQL in Supabase Dashboard → SQL Editor:',
      sql: 'CREATE TABLE IF NOT EXISTS ai_domain_topics (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), domain TEXT NOT NULL, topic TEXT NOT NULL, is_active BOOLEAN DEFAULT true, times_used INTEGER DEFAULT 0, last_used_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT timezone(\'utc\', now())); ALTER TABLE ai_domain_topics ENABLE ROW LEVEL SECURITY; CREATE POLICY "Allow all" ON ai_domain_topics FOR ALL USING (true) WITH CHECK (true);'
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, seeded: data?.length || 0 });
}
