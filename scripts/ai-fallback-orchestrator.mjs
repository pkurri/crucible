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
  // 1. Try Pollinations AI first (completely free, no API key needed)
  try {
    console.log(`   🤖 [AI] Attempting Pollinations AI (Free Tier)...`);
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (response.ok) {
      const text = await response.text();
      if (text && text.trim().length > 0 && !text.includes('Error')) {
        console.log(`   ✅ [AI] Success with Pollinations AI`);
        return text.trim();
      }
    }
  } catch (err) {
    console.warn(`   ⚠️ [AI] Pollinations failed: ${err.message}`);
  }

  // 2. Fallback to OpenRouter if key exists
  let lastError = null;
  if (OPENROUTER_KEY) {
    const models = usePro ? [...PRO_MODELS, ...FREE_MODELS] : FREE_MODELS;
    
    for (const modelId of models) {
      try {
        console.log(`   🤖 [AI] Attempting OpenRouter: ${modelId}...`);
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
        
        // If "User not found" or auth error, break OpenRouter loop immediately
        if (data.error && (data.error.code === 401 || data.error.message?.includes('User not found'))) {
          console.warn(`   ⚠️ [AI] OpenRouter Auth Error: ${data.error.message}. Skipping remaining OpenRouter models.`);
          lastError = data.error.message;
          break; 
        }
        
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
  } else {
    console.warn(`   ⚠️ [AI] OPENROUTER_API_KEY missing, skipping OpenRouter models.`);
  }

  // 3. Final Mock Fallback
  console.warn(`   ⚠️ [AI] ALL AI MODELS EXHAUSTED (${lastError || 'No keys/APIs available'}). USING MOCK FALLBACK.`);
  
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
