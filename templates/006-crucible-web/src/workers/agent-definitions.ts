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

const ANALYST_TARGETS = [
  'https://vercel.com/blog',
  'https://supabase.com/blog',
  'https://react.dev/blog',
  'https://openai.com/blog',
  'https://developers.googleblog.com',
];

export class MarketAnalystAgent implements IForgeAgent {
  name = 'Market Analyst';
  type = 'analyst';

  async execute(supabase: SupabaseClient): Promise<AgentResult> {
    const targetUrl = ANALYST_TARGETS[Math.floor(Math.random() * ANALYST_TARGETS.length)];
    await logTelemetry(supabase, this.type, 'GATHER', `Targeting ${targetUrl} for market intelligence...`);

    try {
      const prompt = `You are a senior market analyst for a developer tools platform called Crucible.
Analyze the latest trends from ${targetUrl} and provide a structured market insight.

Output a raw JSON object (no markdown, no explanation):
{
  "insight_title": "Brief title of the insight",
  "content": "2-3 paragraph analysis of trends, opportunities, and threats",
  "component_type": "market_trend",
  "tags": ["tag1", "tag2", "tag3"],
  "opportunity_score": 7
}`;

      let text = await generateWithYield(prompt);
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const insight = JSON.parse(text);

      await logTelemetry(supabase, this.type, 'ANALYZE', `Extracted insight: "${insight.insight_title}"`);

      const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
      const normalized = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
      const finalEmbedding = mockEmbedding.map(val => val / normalized);

      const { error } = await supabase.from('market_research').insert({
        source_url: targetUrl,
        component_type: insight.component_type || 'market_trend',
        aesthetic_tags: insight.tags || ['market', 'analysis'],
        content: `${insight.insight_title}\n\n${insight.content}`,
        embedding: finalEmbedding,
      });

      if (error) throw error;

      await logTelemetry(supabase, this.type, 'SUCCESS', `Market insight stored: ${insight.insight_title}`);
      return { success: true, message: `Analyzed ${targetUrl}`, data: insight };

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
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const article = JSON.parse(text);

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
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const trendReport = JSON.parse(text);

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
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const newAgent = JSON.parse(text);

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
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const assets = JSON.parse(text);

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
