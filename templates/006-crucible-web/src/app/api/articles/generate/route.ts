import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText } from '@/lib/ai-router';

// Fallback topics only used if Supabase table is empty
const FALLBACK_TOPICS = [
  'How AI is Revolutionizing Drug Discovery',
  'AI-Driven Algorithmic Trading Strategies',
  'Adaptive Learning Platforms Using AI',
  'Predictive Maintenance with AI in Manufacturing',
  'AI-Powered Threat Detection in Cybersecurity',
];

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get topic from request body
    let topic: string | null = null;
    try {
      const body = await request.json();
      if (body.topic) topic = body.topic;
    } catch { /* no body */ }

    // If no topic provided, pull from ai_domain_topics table
    if (!topic) {
      try {
        const { data: topicRows } = await supabase
          .from('ai_domain_topics')
          .select('id, topic, domain')
          .eq('is_active', true)
          .order('times_used', { ascending: true })  // Prefer least-used topics
          .limit(10);

        if (topicRows && topicRows.length > 0) {
          const pick = topicRows[Math.floor(Math.random() * topicRows.length)];
          topic = pick.topic;

          // Increment usage counter
          await supabase
            .from('ai_domain_topics')
            .update({ times_used: (pick as any).times_used + 1 || 1, last_used_at: new Date().toISOString() })
            .eq('id', pick.id);
        }
      } catch {
        // Table might not exist yet, fall through to fallback
      }

      if (!topic) {
        topic = FALLBACK_TOPICS[Math.floor(Math.random() * FALLBACK_TOPICS.length)];
      }
    }

    console.log(`[ARTICLE-GEN] Generating: "${topic}"`);

    // Step 1: Generate full article as plain markdown via multi-provider router
    const articleContent = await generateText(
      `Write a comprehensive, well-researched, SEO-optimized technical article about:

"${topic}"

Requirements:
- Professional, authoritative, and engaging tone
- 800-1200 words minimum
- Use ## for section headings (at least 3-4 sections)
- Include practical examples and real-world data points
- Include statistics or case studies where relevant
- End with a "Key Takeaways" section
- Write for a technical audience (developers, CTOs, engineers)
- Do NOT wrap in JSON — just write the article directly in markdown`
    );

    if (!articleContent || articleContent.length < 200) {
      return NextResponse.json({ error: 'AI returned insufficient content' }, { status: 500 });
    }

    // Step 2: Generate small metadata via router (less likely to fail)
    let meta = {
      title: topic.substring(0, 70),
      slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-'),
      summary: `An in-depth technical analysis of ${topic}`,
      tags: ['ai', 'technology', 'engineering'],
      seo_score: 80,
    };

    try {
      const metaText = await generateText(
        `Given this article topic: "${topic}"
Generate metadata. Output ONLY a JSON object:
{"title": "SEO title under 70 chars", "slug": "url-slug", "summary": "Meta description under 160 chars", "tags": ["tag1", "tag2", "tag3", "tag4"], "seo_score": 85}
No explanation, no markdown fences, just the JSON.`
      );

      const cleaned = metaText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        meta = { ...meta, ...parsed };
      }
    } catch {
      console.warn('[ARTICLE-GEN] Meta generation failed, using defaults');
    }

    const wordCount = articleContent.split(/\s+/).length;
    const uniqueSlug = `${meta.slug}-${Date.now()}`;

    const { data, error } = await supabase.from('generated_articles').insert({
      title: meta.title,
      slug: uniqueSlug,
      content: articleContent,
      summary: meta.summary,
      tags: meta.tags,
      agent_id: 'writer-api',
      status: 'published',
      seo_score: Math.min(meta.seo_score, 100),
      word_count: wordCount,
      topic,
      published_at: new Date().toISOString(),
    }).select().single();

    if (error) throw error;

    await supabase.from('forge_events').insert({
      event_type: 'ARTICLE_GENERATED',
      message: `"${meta.title}" (${wordCount} words, SEO: ${meta.seo_score})`,
      agent_id: 'writer-api',
    });

    console.log(`[ARTICLE-GEN] ✓ "${meta.title}" — ${wordCount} words`);
    return NextResponse.json({ success: true, article: data });
  } catch (error: any) {
    console.error('[ARTICLE-GEN] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
