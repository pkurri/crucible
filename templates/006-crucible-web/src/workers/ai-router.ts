import { GoogleGenAI } from '@google/genai';

/**
 * Multi-API Fallback Router — Worker/Orchestrator Version
 * Priority: Gemini → Cerebras → Groq → SambaNova → Together AI → Mistral → OpenRouter → Anthropic
 * Every provider has a FREE tier with daily/monthly limits.
 * Sign up links:
 *   - Cerebras:     https://cloud.cerebras.ai    (free tier, ultra fast Llama)
 *   - Groq:         https://console.groq.com     (free tier, ~14,400 req/day)
 *   - SambaNova:    https://cloud.sambanova.ai   (free tier, fast Llama/DeepSeek)
 *   - Together AI:  https://api.together.ai      (free $5 credit + free models)
 *   - Mistral:      https://console.mistral.ai   (free tier, 1 req/sec)
 *   - OpenRouter:   https://openrouter.ai        (free :free models)
 */

const PREFIX = '\x1b[35m[ROUTER]\x1b[0m';
const WARN   = '\x1b[33m[ROUTER WAIT]\x1b[0m';

async function tryOpenAICompat(url: string, key: string, model: string, prompt: string): Promise<string | null> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 4096 }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${body.substring(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

export async function generateWithYield(systemPrompt: string): Promise<string> {
  const geminiKey    = process.env.GEMINI_API_KEY;
  const cfToken      = process.env.CLOUDFLARE_API_KEY;
  const cfAccount    = process.env.CLOUDFLARE_ACCOUNT_ID;
  const deepseekKey  = process.env.DEEPSEEK_API_KEY;
  const fireKey      = process.env.FIREWORKS_API_KEY;
  const cerebrasKey  = process.env.CEREBRAS_API_KEY;
  const groqKey      = process.env.GROQ_API_KEY;
  const sambaKey     = process.env.SAMBANOVA_API_KEY;
  const togetherKey  = process.env.TOGETHER_API_KEY;
  const mistralKey   = process.env.MISTRAL_API_KEY;
  const openRouter   = process.env.OPENROUTER_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  const errors: string[] = [];

  // 1. Gemini 2.5 Flash (1,500 req/day free)
  if (geminiKey) {
    try {
      console.log(`${PREFIX} Gemini 2.5 Flash...`);
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const r = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: systemPrompt });
      if (r.text) return r.text;
    } catch (e: any) {
      console.warn(`${WARN} Gemini: ${e.message?.substring(0, 80)}`);
      errors.push(`Gemini: ${e.message}`);
    }
  }

  // 1.1 Cloudflare Workers AI (10,000 req/day free) - NEW
  if (cfToken && cfAccount) {
    const cfModels = [
      '@cf/meta/llama-3.1-8b-instruct',
      '@cf/meta/llama-3-8b-instruct',
      '@cf/mistral/mistral-7b-instruct-v0.1'
    ];
    for (const model of cfModels) {
      try {
        console.log(`${PREFIX} Cloudflare Workers AI ${model}...`);
        const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccount}/ai/run/${model}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${cfToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: systemPrompt }] }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.result?.response) return data.result.response;
        }
      } catch (e: any) {
        console.warn(`${WARN} Cloudflare (${model}): ${e.message?.substring(0, 80)}`);
        errors.push(`Cloudflare(${model}): ${e.message}`);
      }
    }
  }

  // 1.2 DeepSeek Direct (High priority reasoning) - NEW
  if (deepseekKey) {
    for (const model of ['deepseek-chat', 'deepseek-reasoner']) {
      try {
        console.log(`${PREFIX} DeepSeek Direct ${model}...`);
        const text = await tryOpenAICompat('https://api.deepseek.com/v1/chat/completions', deepseekKey, model, systemPrompt);
        if (text) return text;
      } catch (e: any) {
        console.warn(`${WARN} DeepSeek Direct (${model}): ${e.message?.substring(0, 80)}`);
        errors.push(`DeepSeek(${model}): ${e.message}`);
      }
    }
  }

  // 1.3 Fireworks AI ($1 free credit / low cost) - NEW
  if (fireKey) {
    for (const model of ['accounts/fireworks/models/llama-v3p1-70b-instruct', 'accounts/fireworks/models/llama-v3p1-8b-instruct']) {
      try {
        console.log(`${PREFIX} Fireworks AI ${model}...`);
        const text = await tryOpenAICompat('https://api.fireworks.ai/inference/v1/chat/completions', fireKey, model, systemPrompt);
        if (text) return text;
      } catch (e: any) {
        console.warn(`${WARN} Fireworks (${model}): ${e.message?.substring(0, 80)}`);
        errors.push(`Fireworks(${model}): ${e.message}`);
      }
    }
  }

  // 2. Cerebras (free tier, extremely fast)
  if (cerebrasKey) {
    for (const model of ['llama3.1-70b', 'llama3.1-8b', 'llama-4-scout-17b-16e-instruct']) {
      try {
        console.log(`${PREFIX} Cerebras ${model}...`);
        const text = await tryOpenAICompat('https://api.cerebras.ai/v1/chat/completions', cerebrasKey, model, systemPrompt);
        if (text) return text;
      } catch (e: any) {
        console.warn(`${WARN} Cerebras (${model}): ${e.message?.substring(0, 80)}`);
        errors.push(`Cerebras(${model}): ${e.message}`);
      }
    }
  }

  // 3. Groq (14,400 req/day free)
  if (groqKey) {
    for (const model of ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it']) {
      try {
        console.log(`${PREFIX} Groq ${model}...`);
        const text = await tryOpenAICompat('https://api.groq.com/openai/v1/chat/completions', groqKey, model, systemPrompt);
        if (text) return text;
      } catch (e: any) {
        console.warn(`${WARN} Groq (${model}): ${e.message?.substring(0, 80)}`);
        errors.push(`Groq(${model}): ${e.message}`);
      }
    }
  }

  // 4. SambaNova (free tier, fast)
  if (sambaKey) {
    for (const model of ['Meta-Llama-3.3-70B-Instruct', 'DeepSeek-R1-Distill-Llama-70B', 'Qwen2.5-72B-Instruct']) {
      try {
        console.log(`${PREFIX} SambaNova ${model}...`);
        const text = await tryOpenAICompat('https://api.sambanova.ai/v1/chat/completions', sambaKey, model, systemPrompt);
        if (text) return text;
      } catch (e: any) {
        console.warn(`${WARN} SambaNova (${model}): ${e.message?.substring(0, 80)}`);
        errors.push(`SambaNova(${model}): ${e.message}`);
      }
    }
  }

  // 5. Together AI (free models + $5 credit)
  if (togetherKey) {
    for (const model of [
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo-Free',
      'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
    ]) {
      try {
        console.log(`${PREFIX} Together AI ${model}...`);
        const text = await tryOpenAICompat('https://api.together.xyz/v1/chat/completions', togetherKey, model, systemPrompt);
        if (text) return text;
      } catch (e: any) {
        console.warn(`${WARN} Together (${model}): ${e.message?.substring(0, 80)}`);
        errors.push(`Together(${model}): ${e.message}`);
      }
    }
  }

  // 6. Mistral Direct (free tier, 1 req/sec)
  if (mistralKey) {
    try {
      console.log(`${PREFIX} Mistral (mistral-small-latest)...`);
      const text = await tryOpenAICompat('https://api.mistral.ai/v1/chat/completions', mistralKey, 'mistral-small-latest', systemPrompt);
      if (text) return text;
    } catch (e: any) {
      console.warn(`${WARN} Mistral: ${e.message?.substring(0, 80)}`);
      errors.push(`Mistral: ${e.message}`);
    }
  }

  // 7. OpenRouter (free :free models pool)
  if (openRouter) {
    const freeModels = [
      'deepseek/deepseek-chat:free', 'deepseek/deepseek-r1:free',
      'moonshotai/moonshot-v1-8k:free',
      'meta-llama/llama-3.1-8b-instruct:free', 'meta-llama/llama-3-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free', 'mistralai/mistral-small-3.1-24b-instruct:free',
      'microsoft/phi-3-mini-128k-instruct:free', 'microsoft/phi-3-medium-128k-instruct:free',
      'qwen/qwen-2-7b-instruct:free', 'qwen/qwen2.5-7b-instruct:free',
      'google/gemma-2-9b-it:free', 'google/gemma-3-4b-it:free',
      'nousresearch/hermes-3-llama-3.1-8b:free',
    ];
    for (const model of freeModels) {
      try {
        console.log(`${PREFIX} OpenRouter ${model}...`);
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouter}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://crucible.dev',
            'X-Title': 'Crucible AI Forge',
          },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: systemPrompt }], temperature: 0.7 }),
        });
        if (!res.ok) throw new Error(`OpenRouter HTTP error: ${res.status}`);
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      } catch (e: any) {
        console.warn(`${WARN} OpenRouter (${model}): ${e.message?.substring(0, 80)}`);
        errors.push(`OpenRouter(${model}): ${e.message}`);
      }
    }
  }

  // 8. Anthropic Claude Haiku (last resort)
  if (anthropicKey) {
    try {
      console.log(`${PREFIX} Anthropic Claude 3.5 Haiku...`);
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-3-5-haiku-20241022', max_tokens: 4096, messages: [{ role: 'user', content: systemPrompt }] }),
      });
      if (!res.ok) throw new Error(`Anthropic HTTP error: ${res.status}`);
      const data = await res.json();
      if (data.content?.[0]?.text) return data.content[0].text;
    } catch (e: any) {
      console.warn(`${WARN} Anthropic: ${e.message?.substring(0, 80)}`);
      errors.push(`Anthropic: ${e.message}`);
    }
  }

  throw new Error(`All available AI Router paths exhausted. Errors: ${JSON.stringify(errors)}`);
}
