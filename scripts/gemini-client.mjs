import fs from 'fs';

/**
 * Minimal Gemini API client shared by the film pipeline (treatment architect,
 * quality-gate critic, Veo scene generator). Auth: GOOGLE_API_KEY.
 */

export const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
export const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3.1-flash-lite';

export function apiKey() {
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY is not set.');
  return key;
}

export async function geminiFetch(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { 'x-goog-api-key': apiKey(), 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${json?.error?.message || text.slice(0, 300)}`);
  return json;
}

/**
 * Generate text (optionally JSON) from a prompt plus optional local images.
 * @param {string} prompt
 * @param {{system?: string, json?: boolean, images?: string[], model?: string}} opts
 */
export async function generateText(prompt, { system, json = false, images = [], model = TEXT_MODEL } = {}) {
  const parts = [{ text: prompt }];
  for (const img of images) {
    parts.push({ inlineData: { mimeType: img.endsWith('.png') ? 'image/png' : 'image/jpeg', data: fs.readFileSync(img).toString('base64') } });
  }
  const body = {
    contents: [{ role: 'user', parts }],
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    generationConfig: { temperature: 0.9, ...(json ? { responseMimeType: 'application/json' } : {}) },
  };
  const data = await geminiFetch(`${GEMINI_BASE}/models/${model}:generateContent`, { method: 'POST', body: JSON.stringify(body) });
  const out = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  if (!out) throw new Error(`Gemini returned no text (finishReason: ${data?.candidates?.[0]?.finishReason || 'unknown'})`);
  return json ? JSON.parse(out) : out;
}
