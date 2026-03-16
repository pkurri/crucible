import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../templates/006-crucible-web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function safeParseJSON(text) {
  if (!text) throw new Error('Empty AI response.');
  const start = Math.min(
    text.indexOf('{') === -1 ? Infinity : text.indexOf('{'),
    text.indexOf('[') === -1 ? Infinity : text.indexOf('[')
  );
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (start === Infinity || end === -1 || start >= end) throw new Error('No valid JSON structure found.');
  let jsonStr = text.substring(start, end + 1);
  try { return JSON.parse(jsonStr); } catch (e) {
    let repaired = jsonStr.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/gs, (match, content) => {
      return '"' + content
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/[\u0000-\u001F]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
        + '"';
    });
    try { return JSON.parse(repaired); } catch (e2) {
      const cleaned = jsonStr.replace(/[\u0000-\u001F]/g, '').replace(/\n+/g, ' ');
      return JSON.parse(cleaned);
    }
  }
}

let lastCall = 0;
async function throttle() {
  const diff = Date.now() - lastCall;
  if (diff < 3000) await new Promise(r => setTimeout(r, 3000 - diff));
  lastCall = Date.now();
}

async function generateText(systemPrompt, userPrompt) {
  await throttle();
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error('GEMINI_API_KEY missing');

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: { text: systemPrompt } },
      contents: [{ parts: [{ text: userPrompt }] }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function runGenerator() {
  const count = 5;
  const topics = [
      { id: '', topic: 'Agentic AI Workflows', domain: 'Software Engineering' },
      { id: '', topic: 'Quantum Computing Timelines', domain: 'Technology' },
      { id: '', topic: 'AI in Renewable Energy', domain: 'Energy' },
      { id: '', topic: 'The Future of Autonomous Vehicles', domain: 'Transportation' },
      { id: '', topic: 'LLM Context Window Evolution', domain: 'Artificial Intelligence' },
  ];

  console.log(`Starting generation of ${count} infographics...`);

  for (const topicRow of topics) {
    try {
      console.log(`Generating: "${topicRow.topic}"...`);
      const systemPrompt = `Act as an expert data visualization designer and researcher.
Create structural data for a high-impact, modern infographic about the user's provided topic.`;

      const userPrompt = `Topic: "${topicRow.topic}" in the domain of "${topicRow.domain}".

Return EXACTLY and ONLY valid JSON matching this structure:
{
  "title": "A short, catchy main title",
  "subtitle": "A slightly longer explanatory subtitle",
  "dataPoints": [
    { 
      "label": "Short Metric/Stat Name", 
      "value": "A bold number/percentage", 
      "description": "1-2 short sentences"
    }
  ],
  "conclusion": "A single sentence concluding the infographic."
}
Requirement: Provide exactly 4 data points. Do not use Markdown backticks.`;

      const aiResponseText = await generateText(systemPrompt, userPrompt);
      const parsedContent = safeParseJSON(aiResponseText);

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
        console.error(`DB Error: ${error.message}`);
      } else {
        console.log(`Successfully stored "${parsedContent.title}"`);
      }
    } catch (e) {
      console.error(`Failed ${topicRow.topic}: ${e.message}`);
    }
  }
}

runGenerator();
