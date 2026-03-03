import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText } from '@/lib/ai-router';

// Batch generates 10 articles across AI domains.
// Triggered by Vercel Cron: GET /api/articles/generate-batch
// Schedule: daily at 8 AM UTC (see vercel.json)

export const maxDuration = 300; // 5 min max for Vercel

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const count = 10;
  const results: any[] = [];
  const errors: string[] = [];

  // Pull topics from Supabase, prefer least-used
  let topics: { id: string; topic: string; domain: string }[] = [];
  try {
    const { data } = await supabase
      .from('ai_domain_topics')
      .select('id, topic, domain')
      .eq('is_active', true)
      .order('times_used', { ascending: true })
      .limit(count);
    if (data) topics = data;
  } catch { /* table may not exist */ }

  // Fallback if no topics in DB
  if (topics.length === 0) {
    topics = [
      { id: '', topic: 'AI in Healthcare: Diagnostic Revolution', domain: 'Healthcare' },
      { id: '', topic: 'AI-Driven Fraud Detection in Finance', domain: 'Finance' },
      { id: '', topic: 'Adaptive Learning with AI in Education', domain: 'Education' },
      { id: '', topic: 'Predictive Maintenance in Smart Factories', domain: 'Manufacturing' },
      { id: '', topic: 'AI Threat Detection in Cybersecurity', domain: 'Cybersecurity' },
      { id: '', topic: 'NLP Contract Analysis in Legal Tech', domain: 'Legal' },
      { id: '', topic: 'Precision Agriculture with AI Drones', domain: 'Agriculture' },
      { id: '', topic: 'AI-Optimized Smart Energy Grids', domain: 'Energy' },
      { id: '', topic: 'AI Visual Search in E-Commerce', domain: 'Retail' },
      { id: '', topic: 'Agentic AI in Software Engineering', domain: 'Software Engineering' },
    ];
  }

  await supabase.from('forge_events').insert({
    event_type: 'BATCH_START',
    message: `Daily batch: ${count} articles across ${new Set(topics.map(t => t.domain)).size} domains`,
    agent_id: 'writer-batch',
  });

  for (const topicRow of topics.slice(0, count)) {
    try {
      console.log(`[BATCH] Generating: "${topicRow.topic}"`);

      const articleContent = await generateText(
        `Write a comprehensive, well-researched, SEO-optimized article about:
"${topicRow.topic}"

Requirements:
- Professional, authoritative tone — 800-1200 words
- Use ## for section headings (3-4 sections minimum)
- Include practical code examples or technical details
- Include real statistics or case studies
- End with "Key Takeaways"
- Write for developers, CTOs, engineers
- Output plain markdown only, no JSON wrapping`
      );

      if (!articleContent || articleContent.length < 200) {
        errors.push(`${topicRow.topic}: insufficient content`);
        continue;
      }

      // Generate metadata
      let meta = {
        title: topicRow.topic.substring(0, 70),
        slug: topicRow.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        summary: `Deep-dive into ${topicRow.topic}`,
        tags: [topicRow.domain.toLowerCase(), 'ai', 'technology'],
        seo_score: 80,
      };

      try {
        const metaText = await generateText(
          `Topic: "${topicRow.topic}". Output ONLY JSON: {"title":"SEO title","slug":"url-slug","summary":"meta desc","tags":["${topicRow.domain.toLowerCase()}","ai","tag3"],"seo_score":85}`
        );
        const match = metaText.replace(/```json\s*/g, '').replace(/```\s*/g, '').match(/\{[\s\S]*\}/);
        if (match) meta = { ...meta, ...JSON.parse(match[0]) };
      } catch { /* use defaults */ }

      const wordCount = articleContent.split(/\s+/).length;

      const { error } = await supabase.from('generated_articles').insert({
        title: meta.title,
        slug: `${meta.slug}-${Date.now()}`,
        content: articleContent,
        summary: meta.summary,
        tags: meta.tags,
        agent_id: 'writer-batch',
        status: 'published',
        seo_score: Math.min(meta.seo_score, 100),
        word_count: wordCount,
        topic: topicRow.topic,
        published_at: new Date().toISOString(),
      });

      if (error) {
        errors.push(`${topicRow.topic}: ${error.message}`);
      } else {
        results.push({ title: meta.title, words: wordCount, domain: topicRow.domain });

        // Update usage tracking
        if (topicRow.id) {
          await supabase.from('ai_domain_topics')
            .update({ times_used: 1, last_used_at: new Date().toISOString() })
            .eq('id', topicRow.id);
        }
      }

      // Rate limit pause (3s between articles)
      await new Promise(r => setTimeout(r, 3000));
    } catch (e: any) {
      errors.push(`${topicRow.topic}: ${e.message}`);
    }
  }

  await supabase.from('forge_events').insert({
    event_type: 'BATCH_COMPLETE',
    message: `Batch done: ${results.length}/${count} articles, ${errors.length} errors`,
    agent_id: 'writer-batch',
  });

  return NextResponse.json({
    success: true,
    generated: results.length,
    failed: errors.length,
    articles: results,
    errors: errors.length > 0 ? errors : undefined,
  });
}
