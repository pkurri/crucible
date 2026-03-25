#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const NICHES_FILE = path.join(process.cwd(), 'data', 'viral-niches.json');
const TARGET_COUNT = 114;

function cleanJSON(str) {
  try {
    return JSON.parse(str.replace(/```json\n?|```/g, '').trim());
  } catch (e) {
    const start = str.indexOf('{');
    const end = str.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(str.substring(start, end + 1));
    }
    throw e;
  }
}

async function generateBatchNiches(batchSize = 10) {
  const existingNiches = fs.existsSync(NICHES_FILE) 
    ? JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8')).niches 
    : [];

  const existingNames = existingNiches.map(n => n.name);
  
  const systemPrompt = `You are an expert viral content strategist for faceless YouTube/Meta channels.
Generate ${batchSize} UNIQUE, HIGH-QUALITY viral niches that can reach 1M+ subscribers.

REQUIREMENTS:
- Each niche must have viral score > 8.5
- Must support both "meta" and "youtube" platforms
- Must be different from existing: ${existingNames.join(', ')}
- Focus on curiosity, wonder, fear, awe, or mystery
- Must be suitable for AI-generated visuals`;

  const userPrompt = `Generate ${batchSize} viral niches as a JSON array.
Each niche must have:
{
  "name": "CamelCaseName",
  "platforms": ["meta", "youtube"],
  "viralScore": 8.5-10.0,
  "targetEmotion": "Curiosity|Wonder|Fear|Awe|Mystery",
  "reason": "Why this is viral now",
  "ideas": ["3 video title/hook combinations"],
  "keywords": ["5 visual keywords"],
  "voice": "en-US-GuyNeural",
  "priority": false
}

Return ONLY: {"niches": [...]}`;

  try {
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
    
    if (!response.ok || !data.choices || !data.choices[0]) {
      console.error(`❌ API Error:`, data.error || data);
      return [];
    }
    
    const result = cleanJSON(data.choices[0].message.content);
    return result.niches || [];
  } catch (e) {
    console.error(`❌ Batch generation failed: ${e.message}`);
    return [];
  }
}

async function run() {
  console.log(`🚀 Bulk Niche Generator - Target: ${TARGET_COUNT} niches\n`);
  
  let allNiches = fs.existsSync(NICHES_FILE) 
    ? JSON.parse(fs.readFileSync(NICHES_FILE, 'utf8')).niches 
    : [];

  const startCount = allNiches.length;
  console.log(`📊 Starting with ${startCount} niches\n`);

  const batchSize = 5;
  const batches = Math.ceil((TARGET_COUNT - startCount) / batchSize);

  for (let i = 0; i < batches; i++) {
    const remaining = TARGET_COUNT - allNiches.length;
    if (remaining <= 0) break;

    const currentBatchSize = Math.min(batchSize, remaining);
    console.log(`[Batch ${i + 1}/${batches}] Generating ${currentBatchSize} niches...`);

    const newNiches = await generateBatchNiches(currentBatchSize);
    
    if (newNiches.length > 0) {
      // Filter duplicates
      const existingNames = new Set(allNiches.map(n => n.name));
      const uniqueNew = newNiches.filter(n => !existingNames.has(n.name));
      
      allNiches = [...allNiches, ...uniqueNew];
      console.log(`✅ Added ${uniqueNew.length} niches (${allNiches.length}/${TARGET_COUNT})`);
      
      // Save progress after each batch
      fs.writeFileSync(NICHES_FILE, JSON.stringify({ niches: allNiches }, null, 2));
    } else {
      console.log(`⚠️ Batch ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      i--; // Retry
    }

    // Rate limit protection
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n🎉 Generation complete!`);
  console.log(`📊 Final count: ${allNiches.length} niches`);
  console.log(`📁 Saved to: ${NICHES_FILE}`);
}

run();
