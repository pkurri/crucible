import { supabase } from '../lib/supabase.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

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
  { domain: 'Compliance', topic: 'Automated Regulatory Analysis: How AI is Transforming Policy Review' },
  { domain: 'Policy', topic: 'Predictive Analytics in Governance: AI-Powered Policy Outcome Modeling' },
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

async function seed() {
  console.log('Creating ai_domain_topics table...');

  // Create the table via Supabase RPC if needed, or just insert
  // The table should already exist from migration, but let's try inserting
  const { data, error } = await supabase
    .from('ai_domain_topics')
    .insert(TOPICS.map(t => ({ domain: t.domain, topic: t.topic, is_active: true, times_used: 0 })));

  if (error) {
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('Table does not exist yet. Creating via API route...');
      console.log('Please run the SQL migration from the Supabase dashboard.');
      console.log(`
CREATE TABLE ai_domain_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  topic TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
ALTER TABLE ai_domain_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to ai_domain_topics" ON ai_domain_topics FOR ALL USING (true) WITH CHECK (true);
      `);
    } else {
      console.error('Insert error:', error.message);
    }
    process.exit(1);
  }

  console.log(`✅ Seeded ${TOPICS.length} topics across ${new Set(TOPICS.map(t => t.domain)).size} domains`);
  process.exit(0);
}

seed();
