import 'dotenv/config';

/**
 * 🔱 AAK NATION: UNIVERSAL AI FALLBACK ORCHESTRATOR
 * Rotates through free and paid models to ensure 100% uptime.
 */
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

const FREE_MODELS = [
  // ✅ Tier 1: Verified stable free models
  'google/gemini-2.0-flash-lite-001',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  // ✅ Tier 2: Ultra-cheap paid fallback (< $0.001 per call)
  'google/gemini-2.0-flash-001',
  'openai/gpt-4o-mini',
];

const PRO_MODELS = [
  'google/gemini-2.0-flash-001',
  'openai/gpt-4o-mini',
  'anthropic/claude-3-haiku'
];

export async function callAI(prompt, systemPrompt = "You are a viral content architect for AAK Nation.", usePro = false) {
  const models = usePro ? [...PRO_MODELS, ...FREE_MODELS] : FREE_MODELS;
  
  let lastError = null;
  for (const modelId of models) {
    try {
      console.log(`   🤖 [AI] Attempting ${modelId}...`);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://crucible-ai-empire.com',
          'X-Title': 'Crucible Empire'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message.content) {
        console.log(`   ✅ [AI] Success with ${modelId}`);
        return data.choices[0].message.content.trim();
      }
      
      const errMsg = data.error ? data.error.message : 'Unknown error / Empty response';
      console.warn(`   ⚠️ [AI] ${modelId} failed: ${errMsg}`);
      lastError = errMsg;
    } catch (err) {
      console.warn(`   ⚠️ [AI] ${modelId} network error: ${err.message}`);
      lastError = err.message;
    }
    
    // Cool-down before next model to avoid hitting the same provider back-to-back
    await new Promise(r => setTimeout(r, 2000));
  }

  throw new Error(`🔱 ALL AI MODELS EXHAUSTED. Last error: ${lastError}`);
}
