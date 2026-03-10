import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateText } from '@/lib/ai-router';

// Batch generates 5 infographics across AI domains.
// Triggered by Vercel Cron: GET /api/infographics/generate-batch
// Schedule: daily at 9 AM UTC (see vercel.json)

export const maxDuration = 300; // 5 min max for Vercel

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const count = 5;
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
      { id: '', topic: 'Agentic AI Workflows', domain: 'Software Engineering' },
      { id: '', topic: 'Quantum Computing Timelines', domain: 'Technology' },
      { id: '', topic: 'AI in Renewable Energy', domain: 'Energy' },
      { id: '', topic: 'The Future of Autonomous Vehicles', domain: 'Transportation' },
      { id: '', topic: 'LLM Context Window Evolution', domain: 'Artificial Intelligence' },
    ];
  }

  await supabase.from('forge_events').insert({
    event_type: 'INFOGRAPHIC_BATCH_START',
    message: `Daily batch: ${count} infographics across ${new Set(topics.map(t => t.domain)).size} domains`,
    agent_id: 'designer-batch',
  });

  for (const topicRow of topics.slice(0, count)) {
    try {
      console.log(`[BATCH INFOGRAPHIC] Generating: "${topicRow.topic}"`);

      // Prompt the LLM for structured JSON representing the infographic
      const prompt = `Act as an expert data visualization designer and researcher.
Create structural data for a high-impact, modern infographic about: "${topicRow.topic}" in the domain of "${topicRow.domain}".

Return EXACTLY and ONLY valid JSON matching this structure:
{
  "title": "A short, catchy main title",
  "subtitle": "A slightly longer explanatory subtitle",
  "dataPoints": [
    { 
      "label": "Short Metric/Stat Name (e.g., 'Efficiency')", 
      "value": "A bold number/percentage (e.g., '300%')", 
      "description": "1-2 short sentences explaining this metric"
    }
  ],
  "conclusion": "A single sentence concluding the infographic."
}
Requirement: Provide exactly 4 high-quality, realistic (or deeply researched) data points in the 'dataPoints' array. Do not wrap the JSON in Markdown formatting like \`\`\`json.`;

      const aiResponseText = await generateText(prompt);
      
      // Clean up potential markdown formatting from the response
      let cleanJsonText = aiResponseText;
      const jsonMatch = cleanJsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJsonText = jsonMatch[0];
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(cleanJsonText);
      } catch (e) {
        console.error("Failed to parse JSON for infographic:", cleanJsonText);
        errors.push(`${topicRow.topic}: Invalid JSON output from AI`);
        continue;
      }

      if (!parsedContent.title || !parsedContent.dataPoints || !Array.isArray(parsedContent.dataPoints)) {
        errors.push(`${topicRow.topic}: Missing required fields in AI output`);
        continue;
      }

      const slug = topicRow.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { error } = await supabase.from('forge_infographics').insert({
        title: parsedContent.title,
        slug: `${slug}-${Date.now()}`,
        content: JSON.stringify(parsedContent),
        topic: topicRow.topic,
        domain: topicRow.domain,
        created_at: new Date().toISOString(),
      });

      if (error) {
        errors.push(`${topicRow.topic}: ${error.message}`);
        await supabase.from('forge_events').insert({
          event_type: 'INFOGRAPHIC_ERROR',
          message: `Topic: ${topicRow.topic} | Error: ${error.message}`,
          agent_id: 'designer-batch',
          metadata: { topic: topicRow.topic, error: error.message }
        });
      } else {
        results.push({ title: parsedContent.title, domain: topicRow.domain });

        // Update usage tracking so we don't repeat topics too often
        if (topicRow.id) {
          await supabase.from('ai_domain_topics')
            .update({ times_used: 1, last_used_at: new Date().toISOString() })
            .eq('id', topicRow.id);
        }
      }

      // Rate limit pause (3s between generations to avoid getting fully rate limited)
      await new Promise(r => setTimeout(r, 3000));
    } catch (e: any) {
      errors.push(`${topicRow.topic}: ${e.message}`);
      await supabase.from('forge_events').insert({
        event_type: 'INFOGRAPHIC_ERROR',
        message: `Topic: ${topicRow.topic} | Exception: ${e.message}`,
        agent_id: 'designer-batch',
        metadata: { topic: topicRow.topic, error: e.message }
      });
    }
  }

  await supabase.from('forge_events').insert({
    event_type: 'INFOGRAPHIC_BATCH_COMPLETE',
    message: `Batch done: ${results.length}/${count} infographics, ${errors.length} errors`,
    agent_id: 'designer-batch',
  });

  return NextResponse.json({
    success: true,
    generated: results.length,
    failed: errors.length,
    infographics: results,
    errors: errors.length > 0 ? errors : undefined,
  });
}
