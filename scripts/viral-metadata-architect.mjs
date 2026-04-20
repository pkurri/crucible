import fs from 'fs';
import path from 'path';

/**
 * 🕵️ CRUCIBLE VIRAL METADATA ARCHITECT
 * Generates unique, viral titles and descriptions for every niche.
 * NO branding (No AAK Nation references) in public metadata.
 */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const METADATA_FILE = path.join(process.cwd(), 'data', 'viral-metadata.json');
const NICHES_FILE   = path.join(process.cwd(), 'data', 'viral-niches.json');

// Emotion-based fallback title templates for high-CTR without API key
const EMOTION_TITLE_TEMPLATES = {
  Fear:      (t) => `This ${t} Will Keep You Up At Night 😱`,
  Awe:       (t) => `${t} Will Break Your Brain 🤯`,
  Curiosity: (t) => `Scientists Don't Want You To Know About ${t}`,
  Mystery:   (t) => `The ${t} Secret Nobody Talks About 👁️`,
  Wonder:    (t) => `${t} Is More Incredible Than You Think 🌌`,
  Disgust:   (t) => `The Disturbing Truth About ${t} 🚨`,
  Excitement:(t) => `${t} Just Changed Everything Forever ⚡`,
};

function getEmotionTitle(niche) {
  const emotion = niche.targetEmotion || 'Curiosity';
  const fn = EMOTION_TITLE_TEMPLATES[emotion] || EMOTION_TITLE_TEMPLATES['Curiosity'];
  return fn(niche.name);
}

function buildNicheTagsFromKeywords(niche) {
  const base = (niche.keywords || []).slice(0, 15).map(k => k.toLowerCase().replace(/\s+/g, ''));
  const extras = [niche.name.toLowerCase().replace(/\s+/g, ''), 'viral', 'facts', 'shorts', 'trending'];
  return [...new Set([...base, ...extras])].slice(0, 20);
}

async function generateMetadata(niche) {
  const topic = typeof niche === 'string' ? niche : niche.name;
  console.log(`\n📑 [${topic}] Architecting viral metadata...`);

  const systemPrompt = `You are a viral metadata strategist for YouTube Shorts and Instagram Reels.
Your goal is to write titles and descriptions that maximize Click-Through Rate (CTR) for specific niches.
Rule: DO NOT mention "AAK Nation" or any specific channel name.
Structure:
- Title: Curiosity-driven, under 60 chars, emotion-triggering (Fear/Awe/Curiosity/Mystery/Wonder).
- Description: High-hook intro, ends with 15-20 relevant hashtags.
- Tags: 15-20 niche-specific keywords from the niche's domain.
- ig_hook: 1-2 punchy sentences + 3 relevant hashtags.
- fb_hook: 1-2 sentences that provoke engagement (question or bold claim).`;

  const keywordsHint = typeof niche === 'object' && niche.keywords
    ? `\nNiche keywords to use in tags: ${niche.keywords.slice(0, 20).join(', ')}`
    : '';
  const emotionHint = typeof niche === 'object' && niche.targetEmotion
    ? `\nTarget Emotion: ${niche.targetEmotion} — title must trigger this emotion.`
    : '';

  const userPrompt = `Generate viral metadata for the niche: "${topic}".
Rule: NEVER mention "AAK Nation" or any specific channel name.${emotionHint}${keywordsHint}
Return JSON object:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2", ... (15-20 niche-specific tags)],
  "ig_hook": "...",
  "fb_hook": "..."
}`;

  try {
    if (!OPENROUTER_KEY || OPENROUTER_KEY.startsWith('REDACTED')) throw new Error('No API Key');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    console.log(`   ⚠️ Using fallback metadata (Offline/No Key).`);
    const nicheObj = typeof niche === 'object' ? niche : { name: topic };
    const title = getEmotionTitle(nicheObj);
    const tags  = buildNicheTagsFromKeywords(nicheObj);
    const tagStr = tags.map(t => `#${t}`).join(' ');
    return {
      title,
      description: `The truth about ${topic} that most people never discover.\n\n${tagStr}`,
      tags,
      ig_hook: `🔍 ${title} #viral #${topic.toLowerCase().replace(/\s+/g, '')}`,
      fb_hook: `Most people think they understand ${topic}. They don't. Here's what they're missing.`
    };
  }
}

async function run() {
  // Load all niches dynamically instead of a static list
  let topics;
  if (fs.existsSync(NICHES_FILE)) {
    const registry = JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8'));
    topics = registry.niches || [];
    console.log(`📚 Loaded ${topics.length} niches from viral-niches.json`);
  } else {
    console.warn('⚠️ viral-niches.json not found. No metadata to generate.');
    return;
  }

  const filterTopic = process.argv.indexOf('--topic') !== -1 ? process.argv[process.argv.indexOf('--topic') + 1] : null;
  const existingMetadata = fs.existsSync(METADATA_FILE) ? JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8')) : {};

  const allMetadata = { ...existingMetadata };
  for (const niche of topics) {
    if (filterTopic && niche.name !== filterTopic) continue;
    // Only regenerate if missing or explicitly filtered
    if (!allMetadata[niche.name] || filterTopic) {
      allMetadata[niche.name] = await generateMetadata(niche);
    }
  }

  fs.mkdirSync(path.dirname(METADATA_FILE), { recursive: true });
  fs.writeFileSync(METADATA_FILE, JSON.stringify(allMetadata, null, 2));
  console.log(`\n✨ Viral metadata architected and saved to ${METADATA_FILE}`);
}

run();
