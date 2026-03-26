import 'dotenv/config';

/**
 * 🔱 AAK NATION: UNIVERSAL AI FALLBACK ORCHESTRATOR
 * Rotates through free and paid models to ensure 100% uptime.
 */
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

const FREE_MODELS = [
  'google/gemini-2.0-flash-lite-001',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
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
    
    await new Promise(r => setTimeout(r, 2000));
  }

  console.warn(`   ⚠️ [AI] ALL AI MODELS EXHAUSTED (${lastError}). USING MOCK FALLBACK.`);
  
  // Return intelligent mock data based on the prompt content to keep pipeline running
  if (prompt.toLowerCase().includes("script")) {
    return `[HOOK: 3 seconds]
Wait! Stop scrolling! What if I told you that reality is an illusion?
[BODY: 10 seconds]
Ancient texts and modern quantum physics are beginning to agree. The world around us is constructed from probability waves, collapsing only when observed. You are literally creating reality right now.
[CTA: 2 seconds]
Subscribe to awaken your mind!`;
  } else if (prompt.toLowerCase().includes("prompt")) {
    return "cinematic visualization, dramatic lighting, professional photography, highly detailed, 8k resolution, photorealistic, epic composition";
  } else {
    return "Universal placeholder text generated due to AI quota exhaustion. This allows the system to continue operating without crashing.";
  }
}
