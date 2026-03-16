
import { getSupabaseAdmin } from '../templates/006-crucible-web/src/lib/supabase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), './templates/006-crucible-web/.env.local') });

const supabase = getSupabaseAdmin();

const agentsToRegister = [
  {
    name: 'The Visual Architect',
    type: 'visual-architect',
    description: 'Designs style-matched industrial infographics and data visualizations.',
    capabilities: ['layout-design', 'style-flow'],
    status: 'idle'
  },
  {
    name: 'Growth Marketeer',
    type: 'marketeer',
    description: 'Analyzes platform successes for multi-channel growth.',
    capabilities: ['growth-strategy', 'campaign-management'],
    status: 'idle'
  },
  {
    name: 'Revenue Optimizer',
    type: 'revenue',
    description: 'Monetization engine that optimizes pricing and sales copy.',
    capabilities: ['pricing-analysis', 'sales-copy'],
    status: 'idle'
  },
  {
    name: 'Chaos Engineer',
    type: 'chaos-engineer',
    description: 'Proactively identifies and mitigates architectural risks.',
    capabilities: ['risk-assessment', 'vulnerability-detection'],
    status: 'idle'
  },
  {
    name: 'Auto-Healer',
    type: 'auto-healer',
    description: 'Platform self-optimization and recovery guardian.',
    capabilities: ['self-healing', 'remediation'],
    status: 'idle'
  }
];

async function registerAgents() {
  console.log('Registering agents in Supabase...');
  for (const agent of agentsToRegister) {
    const { data, error } = await supabase
      .from('agents_registry')
      .upsert(agent, { onConflict: 'type' });
    
    if (error) {
           console.error(`Failed to register ${agent.name}:`, error.message);
    } else {
           console.log(`Successfully registered ${agent.name}`);
    }
  }
}

registerAgents().then(() => console.log('Done.'));
