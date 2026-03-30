import dotenv from 'dotenv';
dotenv.config();

/**
 * 🔥 LLM Helper — Multi-provider LLM calls for Forge Simulator
 * 
 * Priority: Gemini (free 1500/day) → OpenRouter (free models) → Error
 * No paid services required.
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Call Gemini API (free tier: 1500 req/day for flash)
 */
export async function callGemini(prompt, model = 'gemini-2.0-flash') {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY not set');

  const url = `${GEMINI_URL}/${model}:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

/**
 * Call OpenRouter API (free models: llama-3.1-8b, mistral-7b)
 */
export async function callOpenRouter(prompt, model = 'meta-llama/llama-3.1-8b-instruct:free') {
  if (!OPENROUTER_KEY) throw new Error('OPENROUTER_API_KEY not set');

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': 'https://github.com/pkurri/crucible',
      'X-Title': 'Crucible Forge Simulator'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Universal LLM call with automatic fallback
 * 
 * @param {string} prompt - The prompt to send
 * @param {object} opts - Options
 * @param {string} opts.provider - 'gemini' | 'openrouter' | 'auto'
 * @param {string} opts.model - Specific model override
 * @param {boolean} opts.json - If true, parse response as JSON
 */
export async function callLLM(prompt, opts = {}) {
  const { provider = 'auto', model, json = false } = opts;

  let response;

  if (provider === 'gemini' || (provider === 'auto' && GEMINI_KEY)) {
    try {
      response = await callGemini(prompt, model || 'gemini-2.0-flash');
    } catch (err) {
      if (provider === 'gemini') throw err;
      // Fallback to OpenRouter
      console.warn(`⚠️ Gemini failed, falling back to OpenRouter: ${err.message.slice(0, 80)}`);
      response = await callOpenRouter(prompt, model || 'meta-llama/llama-3.1-8b-instruct:free');
    }
  } else if (provider === 'openrouter' || (provider === 'auto' && OPENROUTER_KEY)) {
    response = await callOpenRouter(prompt, model || 'meta-llama/llama-3.1-8b-instruct:free');
  } else {
    throw new Error('No LLM provider configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY');
  }

  if (json) {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = jsonMatch ? jsonMatch[1].trim() : response.trim();
    try {
      return JSON.parse(raw);
    } catch {
      console.warn('⚠️ Failed to parse LLM JSON, returning raw text');
      return { raw: response };
    }
  }

  return response;
}
