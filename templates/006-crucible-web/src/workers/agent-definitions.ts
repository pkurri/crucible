import { SupabaseClient } from '@supabase/supabase-js';
import { generateWithYield } from './ai-router.js';

// ─────────────────────────────────────────────────────────
// CRUCIBLE AGENT FRAMEWORK — Agent Definitions
// ─────────────────────────────────────────────────────────

export interface IForgeAgent {
  name: string;
  type: string;
  execute(supabase: SupabaseClient): Promise<AgentResult>;
}

export interface AgentResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Robust JSON extraction and sanitization for AI outputs.
 * Designed to handle markdown wrappers, truncated responses, and unescaped newlines.
 */
export function safeParseJSON(text: string): any {
  if (!text) throw new Error('Empty AI response.');

  // 1. Extract potential JSON block
  const start = Math.min(
    text.indexOf('{') === -1 ? Infinity : text.indexOf('{'),
    text.indexOf('[') === -1 ? Infinity : text.indexOf('[')
  );
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));

  if (start === Infinity || end === -1 || start >= end) {
    throw new Error('No valid JSON structure found in output.');
  }

  let jsonStr = text.substring(start, end + 1);

  // 2. Try simple parse first
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // 3. Fallback: targeted repairs
    
    // Remove non-printable control characters (BEL, NUL, etc.) but keep whitespace
    jsonStr = jsonStr.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');

    // Heuristic: Escape newlines that appear INSIDE a string.
    // Logic: If a newline is NOT followed by a structural char like quote, comma, bracket, space-colon, 
    // it's likely a raw newline within a descriptive field.
    jsonStr = jsonStr.replace(/([^,\[\{\}\:\s])\n+(?!"|\s*[\}\]\]])/g, '$1\\n');

    try {
      return JSON.parse(jsonStr);
    } catch (e2: any) {
      // 4. Final attempt: Remove all newlines and see if it helps (some models output multi-line string values)
      try {
        const cleaned = jsonStr.replace(/\n+/g, ' ');
        return JSON.parse(cleaned);
      } catch (e3: any) {
        throw new Error(`JSON Robustness Error: ${e2.message}. Position logic failed. Text sample: ${text.substring(0, 50)}...`);
      }
    }
  }
}

async function logTelemetry(supabase: SupabaseClient, agentId: string, eventType: string, message: string) {
  console.log(`\x1b[36m[${agentId}][${eventType}]\x1b[0m ${message}`);
  try {
    await supabase.from('forge_events').insert({
      event_type: eventType,
      message,
      agent_id: agentId,
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    console.error('Telemetry stream failed:', err);
  }
}

// ═══════════════════════════════════════════════════════
// AGENT 1: Market Analyst
// ═══════════════════════════════════════════════════════

const COMPETITIVE_DOMAINS = [
  'Developer Tooling & Infrastructure',
  'AI Coding Assistants',
  'Vector Databases & RAG Systems',
  'Serverless Edge Computing',
  'Multi-Agent Frameworks',
  'Enterprise Security & Compliance',
  'Data Pipeline Orchestration',
  'Frontend UI Component Libraries',
  'API Gateways & Management',
  'Automated QA & Testing',
  'Context Retrieval & Knowledge Sync (Airweave-style)'
];

export class MarketAnalystAgent implements IForgeAgent {
  name = 'Market Analyst';
  type = 'analyst';

  async execute(supabase: SupabaseClient): Promise<AgentResult> {
    const domain = COMPETITIVE_DOMAINS[Math.floor(Math.random() * COMPETITIVE_DOMAINS.length)];
    await logTelemetry(supabase, this.type, 'GATHER', `Analyzing competitive landscape for: ${domain}`);

    try {
      const prompt = `You are a Senior Market Intelligence AI for a B2B SaaS platform called Crucible.
Your task is to analyze the competitive landscape for the following domain:
🎯 DOMAIN: ${domain}

Identify 2-3 leading competitors or open-source solutions currently dominating this space.
Analyze their approach, and identify a "Market Gap" where Crucible could build a superior, AI-first platform template.

Output a RAW JSON object ONLY (no markdown formatting, no explanations):
{
  "insight_title": "Brief title of the competitive analysis",
  "content": "2-3 paragraphs analyzing the competitors and the specific market gap.",
  "component_type": "market_trend",
  "tags": ["competitor-analysis", "tag1", "tag2"],
  "opportunity_score": 8
}`;

      let text = await generateWithYield(prompt);
      const insight = safeParseJSON(text);

      await logTelemetry(supabase, this.type, 'ANALYZE', `Extracted insight: "${insight.insight_title}"`);

      const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
      const normalized = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
      const finalEmbedding = mockEmbedding.map(val => val / normalized);

      const { error } = await supabase.from('market_research').insert({
        source_url: `competitive_analysis://${domain.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        component_type: insight.component_type || 'market_trend',
        aesthetic_tags: insight.tags || ['market', 'analysis', 'competitors'],
        content: `${insight.insight_title}\n\n${insight.content}`,
        embedding: finalEmbedding,
      });

      if (error) throw error;

      await logTelemetry(supabase, this.type, 'SUCCESS', `Market insight stored: ${insight.insight_title}`);
      return { success: true, message: `Analyzed domain: ${domain}`, data: insight };

    } catch (e: any) {
      await logTelemetry(supabase, this.type, 'ERROR', `Analysis failed: ${e.message}`);
      return { success: false, message: e.message };
    }
  }
}

// ═══════════════════════════════════════════════════════
// AGENT 2: Content Writer
// ═══════════════════════════════════════════════════════

const ARTICLE_TOPICS = [
  'AI-Powered Development Workflows',
  'Building Resilient Microservices with Edge Functions',
  'The Future of Real-Time Collaboration in Developer Tools',
  'How Vector Databases Are Changing Search Forever',
  'Industrial-Grade CI/CD Pipelines for Modern Teams',
  'Autonomous Code Generation: Promise vs Reality',
  'Serverless Architecture Patterns for 2026',
  'Building Multi-Agent Systems That Actually Ship',
  'The Rise of Agentic AI in Software Engineering',
  'Zero-Downtime Deployments at Scale',
];

export class ContentWriterAgent implements IForgeAgent {
  name = 'Content Writer';
  type = 'writer';

  async execute(supabase: SupabaseClient, topic?: string): Promise<AgentResult> {
    let articleTopic = topic;

    if (!articleTopic) {
      const { data: insights } = await supabase
        .from('market_research')
        .select('content')
        .order('created_at', { ascending: false })
        .limit(3);

      await logTelemetry(supabase, this.type, 'RESEARCH', `Loaded ${insights?.length || 0} market insights for context`);
      articleTopic = ARTICLE_TOPICS[Math.floor(Math.random() * ARTICLE_TOPICS.length)];
    }

    await logTelemetry(supabase, this.type, 'WRITE', `Generating article: "${articleTopic}"`);

    try {
      const prompt = `You are an expert technical content writer for Crucible, an industrial AI forge platform.
Write a comprehensive, SEO-optimized article about: "${articleTopic}"

Requirements:
- Professional, authoritative tone
- Include practical code examples where relevant
- 800-1200 words
- Include clear headings and subheadings

Output a raw JSON object (no markdown, no explanation):
{
  "title": "Compelling SEO title (max 70 chars)",
  "slug": "url-friendly-slug",
  "summary": "Meta description (max 160 chars)",
  "content": "Full article in markdown format",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "seo_score": 85
}`;

      let text = await generateWithYield(prompt);
      const article = safeParseJSON(text);

      const wordCount = article.content.split(/\s+/).length;
      const uniqueSlug = `${article.slug}-${Date.now()}`;

      const { error } = await supabase.from('generated_articles').insert({
        title: article.title,
        slug: uniqueSlug,
        content: article.content,
        summary: article.summary,
        tags: article.tags || [],
        agent_id: this.type,
        status: 'published',
        seo_score: article.seo_score || 75,
        word_count: wordCount,
        topic: articleTopic,
        published_at: new Date().toISOString(),
      });

      if (error) throw error;

      await logTelemetry(supabase, this.type, 'PUBLISHED', `"${article.title}" — ${wordCount} words, SEO: ${article.seo_score}`);
      return { success: true, message: `Published: ${article.title}`, data: { ...article, word_count: wordCount } };

    } catch (e: any) {
      await logTelemetry(supabase, this.type, 'ERROR', `Article generation failed: ${e.message}`);
      return { success: false, message: e.message };
    }
  }
}

// ═══════════════════════════════════════════════════════
// AGENT 3: Trend Scout
// ═══════════════════════════════════════════════════════

export class TrendScoutAgent implements IForgeAgent {
  name = 'Trend Scout';
  type = 'scout';

  async execute(supabase: SupabaseClient): Promise<AgentResult> {
    await logTelemetry(supabase, this.type, 'SCAN', 'Aggregating market data for trend analysis...');

    try {
      const { data: research } = await supabase
        .from('market_research')
        .select('content, component_type, aesthetic_tags, source_url, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: articles } = await supabase
        .from('generated_articles')
        .select('title, tags, topic')
        .order('created_at', { ascending: false })
        .limit(5);

      const dataPayload = JSON.stringify({
        market_research: research || [],
        recent_articles: articles || [],
      });

      const prompt = `You are the Trend Scout agent in the Crucible AI platform.
Analyze the following aggregated data and identify 2-3 emerging trends:

${dataPayload}

Output a raw JSON object (no markdown, no explanation):
{
  "trends": [
    {
      "name": "Trend name",
      "description": "What this trend means for developer tools",
      "confidence": 82,
      "recommended_action": "What Crucible should build or focus on",
      "related_tags": ["tag1", "tag2"]
    }
  ],
  "summary": "1-2 sentence executive summary"
}`;

      let text = await generateWithYield(prompt);
      const trendReport = safeParseJSON(text);

      const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
      const normalized = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
      const finalEmbedding = mockEmbedding.map(val => val / normalized);

      await supabase.from('market_research').insert({
        source_url: 'internal://trend-scout',
        component_type: 'trend_report',
        aesthetic_tags: trendReport.trends?.flatMap((t: any) => t.related_tags) || ['trends'],
        content: `TREND REPORT: ${trendReport.summary}\n\n${trendReport.trends?.map((t: any) => `## ${t.name}\n${t.description}\n**Confidence:** ${t.confidence}%\n**Action:** ${t.recommended_action}`).join('\n\n')}`,
        embedding: finalEmbedding,
      });

      await logTelemetry(supabase, this.type, 'REPORT', `Identified ${trendReport.trends?.length || 0} emerging trends`);
      return { success: true, message: trendReport.summary, data: trendReport };

    } catch (e: any) {
      await logTelemetry(supabase, this.type, 'ERROR', `Trend analysis failed: ${e.message}`);
      return { success: false, message: e.message };
    }
  }
}

// ═══════════════════════════════════════════════════════
// AGENT 4: Agent Spawner (Meta-Agent)
// ═══════════════════════════════════════════════════════

export class AgentSpawnerAgent implements IForgeAgent {
  name = 'Agent Spawner';
  type = 'spawner';

  async execute(supabase: SupabaseClient): Promise<AgentResult> {
    await logTelemetry(supabase, this.type, 'ANALYZE', 'Scanning platform for capability gaps...');

    try {
      const { data: existingAgents } = await supabase
        .from('agents_registry')
        .select('name, type, description, capabilities');

      const { data: trends } = await supabase
        .from('market_research')
        .select('content')
        .eq('component_type', 'trend_report')
        .order('created_at', { ascending: false })
        .limit(3);

      const prompt = `You are the Agent Spawner — a meta-agent in the Crucible AI Forge platform.
Your job is to invent ONE new specialized AI agent that fills a gap in the platform.

Current agents:
${JSON.stringify(existingAgents || [], null, 2)}

Recent trend intelligence:
${trends?.map(t => t.content).join('\n---\n') || 'No trend data available yet.'}

Rules:
- The new agent must be DIFFERENT from existing ones
- It must serve a real engineering or business need
- Give it a creative, industrial-themed name

Output a raw JSON object (no markdown, no explanation):
{
  "name": "Agent Name",
  "type": "lowercase-type-id",
  "description": "What this agent does and why it is valuable",
  "capabilities": ["cap1", "cap2", "cap3"],
  "reasoning": "Why this agent fills a gap"
}`;

      let text = await generateWithYield(prompt);
      const newAgent = safeParseJSON(text);

      const isDuplicate = existingAgents?.some(
        a => a.type === newAgent.type || a.name.toLowerCase() === newAgent.name.toLowerCase()
      );

      if (isDuplicate) {
        await logTelemetry(supabase, this.type, 'SKIP', `Agent "${newAgent.name}" already exists.`);
        return { success: true, message: 'No new agent needed', data: null };
      }

      const { error } = await supabase.from('agents_registry').insert({
        name: newAgent.name,
        type: newAgent.type,
        description: newAgent.description,
        status: 'idle',
        capabilities: newAgent.capabilities,
      });

      if (error) throw error;

      await logTelemetry(supabase, this.type, 'SPAWNED', `New agent born: "${newAgent.name}" — ${newAgent.description}`);
      return { success: true, message: `Spawned: ${newAgent.name}`, data: newAgent };

    } catch (e: any) {
      await logTelemetry(supabase, this.type, 'ERROR', `Agent spawning failed: ${e.message}`);
      return { success: false, message: e.message };
    }
  }
}

// ═══════════════════════════════════════════════════════
// AGENT 5: Builder Agent (Constructor)
// ═══════════════════════════════════════════════════════

export class BuilderAgent implements IForgeAgent {
  name = 'Builder Agent';
  type = 'builder';

  async execute(supabase: SupabaseClient): Promise<AgentResult> {
    // 1. Check for queued Blueprints
    await logTelemetry(supabase, this.type, 'SCAN', 'Checking for queued architectural blueprints...');
    
    const { data: blueprints, error: fetchErr } = await supabase
      .from('forge_blueprints')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1);

    if (fetchErr) return { success: false, message: `Failed to fetch blueprints: ${fetchErr.message}` };
    if (!blueprints || blueprints.length === 0) return { success: true, message: 'No queued blueprints found.' };

    const blueprint = blueprints[0];
    await logTelemetry(supabase, this.type, 'ACQUIRED', `Acquired blueprint: ${blueprint.name} (TPL-${blueprint.template_id})`);

    // 2. Mark as building
    await supabase.from('forge_blueprints').update({ status: 'building' }).eq('id', blueprint.id);
    await logTelemetry(supabase, this.type, 'FORGE', `Initiating construction sequence for ${blueprint.name}...`);

    try {
      // 3. Gather Context: Pull random skills to simulate context gathering
      const { data: skills } = await supabase
        .from('forge_skills')
        .select('name, category, description')
        .limit(10);
        
      const skillsContext = skills 
        ? skills.map(s => `- ${s.name} (${s.category}): ${s.description}`).join('\n')
        : 'General web development skills';

      // 4. Generate Assets Schema
      const prompt = `You are the Master Architect AI in the Crucible Forge.
Your task is to interpret an architectural blueprint and produce the required code assets.

Blueprint Name: ${blueprint.name}
Template ID: ${blueprint.template_id}
Blueprint Specification (JSON):
${JSON.stringify(blueprint.spec, null, 2)}

Available Core Skills (Context):
${skillsContext}

Generate EXACTLY 3 core assets needed to build this platform template.
For each asset, provide:
1. component_name: The name of the file or component (e.g., 'AuthContext.tsx', '/api/users', 'users_table')
2. type: Must be one of ["ui_schema", "api_route", "db_schema"]
3. code_schema: A JSON structure representing the core logic, state, props, or schema fields.

Output a RAW JSON array ONLY (no markdown formatting, no explanations):
[
  {
    "component_name": "string",
    "type": "string",
    "code_schema": { ... }
  }
]`;

      let text = await generateWithYield(prompt);
      const assets = safeParseJSON(text);

      if (!Array.isArray(assets)) throw new Error('Generated output is not an array.');

      await logTelemetry(supabase, this.type, 'COMPILE', `Successfully compiled ${assets.length} architectural assets.`);

      // 5. Insert Assets
      for (const asset of assets) {
        const validTypes = ['ui_schema', 'api_route', 'db_schema'];
        const assetType = validTypes.includes(asset.type) ? asset.type : 'ui_schema';

        const { error: insertErr } = await supabase.from('forged_assets').insert({
          blueprint_id: blueprint.id,
          component_name: asset.component_name,
          type: assetType,
          code_schema: asset.code_schema,
          status: 'draft'
        });

        if (insertErr) {
          await logTelemetry(supabase, this.type, 'WARNING', `Failed to insert asset ${asset.component_name}: ${insertErr.message}`);
        } else {
          await logTelemetry(supabase, this.type, 'ASSET', `Forged asset: ${asset.component_name} [${assetType}]`);
        }
      }

      // 6. Mark Blueprint deployed
      await supabase.from('forge_blueprints').update({ status: 'deployed' }).eq('id', blueprint.id);
      await logTelemetry(supabase, this.type, 'DEPLOY', `Blueprint ${blueprint.name} construction completed. Assets deployed to Forge.`);

      return { success: true, message: `Forged blueprint ${blueprint.name}`, data: assets };

    } catch (err: any) {
      // Revert status to failed
      await supabase.from('forge_blueprints').update({ status: 'failed' }).eq('id', blueprint.id);
      await logTelemetry(supabase, this.type, 'FATAL', `Construction failed for ${blueprint.name}: ${err.message}`);
      return { success: false, message: `Failed to construct blueprint: ${err.message}` };
    }
  }
}

// ═══════════════════════════════════════════════════════
// AGENT 6: Template Architect
// ═══════════════════════════════════════════════════════

export class TemplateArchitectAgent implements IForgeAgent {
  name = 'Template Architect';
  type = 'architect';

  async execute(supabase: SupabaseClient): Promise<AgentResult> {
    await logTelemetry(supabase, this.type, 'SCAN', 'Scanning market research for new platform template ideas...');

    try {
      // 1. Gather recent trends
      const { data: trends } = await supabase
        .from('market_research')
        .select('content')
        .order('created_at', { ascending: false })
        .limit(3);

      const trendContext = trends?.map(t => t.content).join('\n---\n') || 'General SaaS patterns';

      // 2. Gather existing template IDs to avoid duplicate concepts (just names)
      const { data: existingTemplates } = await supabase
        .from('forge_templates')
        .select('name, category')
        .limit(10);
      
      const existingContext = existingTemplates
        ? existingTemplates.map(t => `- ${t.name} (${t.category})`).join('\n')
        : 'None';

      const prompt = `You are the Template Architect AI in the Crucible Forge.
Your job is to invent ONE new, highly-demanded software platform template based on recent market trends.

Recent Market Context:
${trendContext}

Recently built templates to AVOID duplicating exactly:
${existingContext}

Output a raw JSON object (no markdown, no explanation) representing the new template:
{
  "template_id": "unique-kebab-case-id",
  "name": "Creative Platform Name",
  "category": "e.g., Development, Security, AI, Data, E-Commerce, etc.",
  "description": "2-3 sentences describing what the template builds and its value.",
  "icon": "Lucide icon name (e.g., BrainCircuit, Shield, Database, Cloud, Zap, Fingerprint, Lock, Terminal)",
  "tier": "Free" | "Pro" | "Enterprise",
  "complexity": "Low" | "Medium" | "High",
  "estimated_setup": "e.g., 2-5 minutes",
  "included_agents": ["Agent1", "Agent2"],
  "capabilities": ["Capability 1", "Capability 2"],
  "integrations": ["Integration 1", "Integration 2"]
}`;

      let text = await generateWithYield(prompt);
      const newTemplate = safeParseJSON(text);

      // Check if ID already exists
      const { data: check } = await supabase
        .from('forge_templates')
        .select('id')
        .eq('template_id', newTemplate.template_id)
        .single();

      if (check) {
        await logTelemetry(supabase, this.type, 'SKIP', `Template ${newTemplate.template_id} already exists.`);
        return { success: true, message: `Template ${newTemplate.template_id} exists`, data: null };
      }

      // 3. Insert into forge_templates
      const { error } = await supabase.from('forge_templates').insert({
        template_id: newTemplate.template_id,
        name: newTemplate.name,
        category: newTemplate.category,
        description: newTemplate.description,
        icon: newTemplate.icon || 'Box',
        tier: newTemplate.tier || 'Pro',
        complexity: newTemplate.complexity || 'Medium',
        estimated_setup: newTemplate.estimated_setup || '5 minutes',
        included_agents: newTemplate.included_agents || [],
        capabilities: newTemplate.capabilities || [],
        integrations: newTemplate.integrations || []
      });

      if (error) throw error;

      await logTelemetry(supabase, this.type, 'ARCHITECT', `Designed new template: "${newTemplate.name}"`);
      return { success: true, message: `Created template: ${newTemplate.name}`, data: newTemplate };

    } catch (e: any) {
      await logTelemetry(supabase, this.type, 'ERROR', `Template architecture failed: ${e.message}`);
      return { success: false, message: e.message };
    }
  }
}
// ═══════════════════════════════════════════════════════
// AGENT 7: Blueprint Spawner
// ═══════════════════════════════════════════════════════

export class BlueprintSpawnerAgent implements IForgeAgent {
  name = 'Blueprint Spawner';
  type = 'spawner_v2'; // Distinct from meta-spawner

  async execute(supabase: SupabaseClient): Promise<AgentResult> {
    await logTelemetry(supabase, this.type, 'SCAN', 'Scanning templates for potential autonomous build opportunities...');

    try {
      // 1. Find templates that don't have active blueprints
      const { data: templates } = await supabase
        .from('forge_templates')
        .select('*')
        .limit(20);

      const { data: existingBlueprints } = await supabase
        .from('forge_blueprints')
        .select('template_id')
        .in('status', ['queued', 'building', 'deployed']);

      const builtTemplateIds = new Set(existingBlueprints?.map(b => b.template_id) || []);
      const buildableTemplates = templates?.filter(t => !builtTemplateIds.has(t.template_id)) || [];

      if (buildableTemplates.length === 0) {
        await logTelemetry(supabase, this.type, 'IDLE', 'No new architecture gaps found in local armory.');
        return { success: true, message: 'No build opportunities found.' };
      }

      // 2. Select the most promising template
      const template = buildableTemplates[Math.floor(Math.random() * buildableTemplates.length)];
      await logTelemetry(supabase, this.type, 'TARGET', `Selected target for autonomous construction: ${template.name}`);

      // 3. Create Blueprint
      const { error } = await supabase.from('forge_blueprints').insert({
        template_id: template.template_id,
        name: `${template.name} (Auto-Forge)`,
        status: 'queued',
        spec: {
          ...template,
          autonomous: true,
          forge_sequence: 'standard-v1'
        }
      });

      if (error) throw error;

      await logTelemetry(supabase, this.type, 'QUEUED', `Blueprint deployed to construction queue: ${template.name}`);
      return { success: true, message: `Queued: ${template.name}`, data: template };

    } catch (e: any) {
      await logTelemetry(supabase, this.type, 'ERROR', `Blueprint spawning failed: ${e.message}`);
      return { success: false, message: e.message };
    }
  }
}

// ═══════════════════════════════════════════════════════
// AGENT 8: Intel Manager
// ═══════════════════════════════════════════════════════

export class IntelManagerAgent implements IForgeAgent {
  name = 'Intel Manager';
  type = 'intel_manager';

  async execute(supabase: SupabaseClient): Promise<AgentResult> {
    await logTelemetry(supabase, this.type, 'SCAN', 'Scanning for competitive intelligence and market gaps...');

    try {
      // 1. Gather recent market research and blueprints
      const { data: research } = await supabase
        .from('market_research')
        .select('content, aesthetic_tags')
        .order('created_at', { ascending: false })
        .limit(5);

      const prompt = `You are the Intel Manager for Crucible.
Your goal is to synthesize internal market research into "Actionable Intelligence" (Intel).
Focus on identifying high-value features or platform gaps that are not yet addressed by existing blueprints.

Research Context:
${research?.map(r => r.content).join('\n---\n') || 'General SaaS market research'}

Output a RAW JSON object (no markdown, no explanation):
{
  "title": "Short descriptive title",
  "analysis": "A deep-dive analysis of why this is a gap",
  "recommended_template": "A name for a potential new template",
  "priority": "Critical" | "High" | "Medium",
  "tags": ["intel", "gap-analysis"]
}`;

      let text = await generateWithYield(prompt);
      const intel = safeParseJSON(text);

      // 2. Store as market research with specialized type
      const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
      const normalized = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
      const finalEmbedding = mockEmbedding.map(val => val / normalized);

      await supabase.from('market_research').insert({
        source_url: 'internal://intel-manager',
        component_type: 'gap_intel',
        aesthetic_tags: intel.tags || ['intel'],
        content: `INTEL: ${intel.title}\n\n${intel.analysis}\n\nRecommended: ${intel.recommended_template}\nPriority: ${intel.priority}`,
        embedding: finalEmbedding,
      });

      await logTelemetry(supabase, this.type, 'SUCCESS', `Generated Intel: "${intel.title}" (Priority: ${intel.priority})`);
      return { success: true, message: `Intel generated: ${intel.title}`, data: intel };

    } catch (e: any) {
      await logTelemetry(supabase, this.type, 'ERROR', `Intel management failed: ${e.message}`);
      return { success: false, message: e.message };
    }
  }
}

// ═══════════════════════════════════════════════════════
// AGENT 9: Forge Overseer
// ═══════════════════════════════════════════════════════

export class ForgeOverseerAgent implements IForgeAgent {
  name = 'Forge Overseer';
  type = 'overseer';

  async execute(supabase: SupabaseClient): Promise<AgentResult> {
    await logTelemetry(supabase, this.type, 'AUDIT', 'Performing platform architectural audit...');

    try {
      // 1. Audit templates and blueprints
      const { data: templates } = await supabase.from('forge_templates').select('id, name');
      const { data: blueprints } = await supabase.from('forge_blueprints').select('id, status, name');

      const prompt = `You are the Forge Overseer.
You audit the current state of blueprints and templates to suggest maintenance or evolution actions.

Templates: ${templates?.length || 0}
Blueprints: ${blueprints?.length || 0}
Building/Failed: ${blueprints?.filter(b => b.status === 'building' || b.status === 'failed').length || 0}

Output a RAW JSON object (no markdown, no explanation):
{
  "audit_report": "Summary of platform health",
  "suggested_maintenance": "e.g., Retry failed blueprints, consolidate templates",
  "evolution_path": "What is the next big architectural shift?"
}`;

      let text = await generateWithYield(prompt);
      const audit = safeParseJSON(text);

      await logTelemetry(supabase, this.type, 'HEALTH', audit.audit_report);
      
      return { success: true, message: `Audit complete: ${audit.audit_report.substring(0, 50)}...`, data: audit };

    } catch (e: any) {
      await logTelemetry(supabase, this.type, 'ERROR', `Overseer audit failed: ${e.message}`);
      return { success: false, message: e.message };
    }
  }
}
