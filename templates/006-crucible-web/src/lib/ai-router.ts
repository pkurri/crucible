import { GoogleGenAI } from '@google/genai';

/**
 * Multi-Provider AI Router
 * Priority order: Gemini → Cerebras → Groq → SambaNova → Together AI → Mistral → OpenRouter → Anthropic
 * Every provider here offers a FREE tier with daily/monthly limits.
 * Sign up links:
 *   - Gemini:       https://aistudio.google.com  (free tier, 1500 req/day)
 *   - Cerebras:     https://cloud.cerebras.ai    (free tier, ultra fast)
 *   - Groq:         https://console.groq.com     (free tier, 14,400 req/day)
 *   - SambaNova:    https://cloud.sambanova.ai   (free tier)
 *   - Together AI:  https://api.together.ai      (free $5 credit + free models)
 *   - Mistral:      https://console.mistral.ai   (free tier, 1 req/sec)
 *   - OpenRouter:   https://openrouter.ai        (free tier, many :free models)
 *   - Anthropic:    https://console.anthropic.com (free tier)
 */

async function tryOpenAICompatible(
  url: string,
  key: string,
  model: string,
  prompt: string,
  label: string
): Promise<string | null> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`${label} HTTP ${res.status}: ${errBody.substring(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

export async function generateText(prompt: string): Promise<string> {
  const geminiKey     = process.env.GEMINI_API_KEY;
  const cerebrasKey   = process.env.CEREBRAS_API_KEY;
  const groqKey       = process.env.GROQ_API_KEY;
  const sambaNovaKey  = process.env.SAMBANOVA_API_KEY;
  const togetherKey   = process.env.TOGETHER_API_KEY;
  const mistralKey    = process.env.MISTRAL_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey  = process.env.ANTHROPIC_API_KEY;

  const errors: string[] = [];

  // ─── 1. Gemini (1,500 req/day free) ─────────────────────────────────────
  if (geminiKey) {
    try {
      console.log('[ROUTER] Trying Gemini 2.5 Flash...');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      if (response.text) {
        console.log('[ROUTER] ✓ Gemini succeeded');
        return response.text;
      }
    } catch (e: any) {
      const msg = e.message?.substring(0, 120) || 'unknown';
      console.warn(`[ROUTER] ✗ Gemini: ${msg}`);
      errors.push(`Gemini: ${msg}`);
    }
  }

  // ─── 2. Cerebras (free tier, extremely fast inference) ───────────────────
  if (cerebrasKey) {
    const cerebrasModels = ['llama3.1-70b', 'llama3.1-8b', 'llama-4-scout-17b-16e-instruct'];
    for (const model of cerebrasModels) {
      try {
        console.log(`[ROUTER] Trying Cerebras ${model}...`);
        const text = await tryOpenAICompatible(
          'https://api.cerebras.ai/v1/chat/completions',
          cerebrasKey, model, prompt, 'Cerebras'
        );
        if (text) {
          console.log(`[ROUTER] ✓ Cerebras (${model}) succeeded`);
          return text;
        }
      } catch (e: any) {
        console.warn(`[ROUTER] ✗ Cerebras (${model}): ${e.message?.substring(0, 120)}`);
        errors.push(`Cerebras (${model}): ${e.message?.substring(0, 120)}`);
      }
    }
  }

  // ─── 3. Groq (14,400 req/day free) ────────────────────────────────────── 
  if (groqKey) {
    const groqModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    for (const model of groqModels) {
      try {
        console.log(`[ROUTER] Trying Groq ${model}...`);
        const text = await tryOpenAICompatible(
          'https://api.groq.com/openai/v1/chat/completions',
          groqKey, model, prompt, 'Groq'
        );
        if (text) {
          console.log(`[ROUTER] ✓ Groq (${model}) succeeded`);
          return text;
        }
      } catch (e: any) {
        console.warn(`[ROUTER] ✗ Groq (${model}): ${e.message?.substring(0, 120)}`);
        errors.push(`Groq (${model}): ${e.message?.substring(0, 120)}`);
      }
    }
  }

  // ─── 4. SambaNova (free tier, fast Llama) ────────────────────────────────
  if (sambaNovaKey) {
    const sambaModels = ['Meta-Llama-3.3-70B-Instruct', 'DeepSeek-R1-Distill-Llama-70B', 'Qwen2.5-72B-Instruct'];
    for (const model of sambaModels) {
      try {
        console.log(`[ROUTER] Trying SambaNova ${model}...`);
        const text = await tryOpenAICompatible(
          'https://api.sambanova.ai/v1/chat/completions',
          sambaNovaKey, model, prompt, 'SambaNova'
        );
        if (text) {
          console.log(`[ROUTER] ✓ SambaNova (${model}) succeeded`);
          return text;
        }
      } catch (e: any) {
        console.warn(`[ROUTER] ✗ SambaNova (${model}): ${e.message?.substring(0, 120)}`);
        errors.push(`SambaNova (${model}): ${e.message?.substring(0, 120)}`);
      }
    }
  }

  // ─── 5. Together AI (free models + $5 free credit) ────────────────────────
  if (togetherKey) {
    const togetherModels = [
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo-Free',
      'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
    ];
    for (const model of togetherModels) {
      try {
        console.log(`[ROUTER] Trying Together AI ${model}...`);
        const text = await tryOpenAICompatible(
          'https://api.together.xyz/v1/chat/completions',
          togetherKey, model, prompt, 'Together'
        );
        if (text) {
          console.log(`[ROUTER] ✓ Together AI (${model}) succeeded`);
          return text;
        }
      } catch (e: any) {
        console.warn(`[ROUTER] ✗ Together AI (${model}): ${e.message?.substring(0, 120)}`);
        errors.push(`Together (${model}): ${e.message?.substring(0, 120)}`);
      }
    }
  }

  // ─── 6. Mistral Direct (free tier, 1 req/sec) ────────────────────────────
  if (mistralKey) {
    try {
      console.log('[ROUTER] Trying Mistral (mistral-small-latest)...');
      const text = await tryOpenAICompatible(
        'https://api.mistral.ai/v1/chat/completions',
        mistralKey, 'mistral-small-latest', prompt, 'Mistral'
      );
      if (text) {
        console.log('[ROUTER] ✓ Mistral succeeded');
        return text;
      }
    } catch (e: any) {
      console.warn(`[ROUTER] ✗ Mistral: ${e.message?.substring(0, 120)}`);
      errors.push(`Mistral: ${e.message?.substring(0, 120)}`);
    }
  }

  // ─── 7. OpenRouter (free :free tagged models) ─────────────────────────────
  if (openRouterKey) {
    const freeModels = [
      'deepseek/deepseek-chat:free',
      'deepseek/deepseek-r1:free',
      'moonshotai/moonshot-v1-8k:free',
      'meta-llama/llama-3.1-8b-instruct:free',
      'meta-llama/llama-3-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      'mistralai/mistral-small-3.1-24b-instruct:free',
      'microsoft/phi-3-mini-128k-instruct:free',
      'microsoft/phi-3-medium-128k-instruct:free',
      'qwen/qwen-2-7b-instruct:free',
      'qwen/qwen2.5-7b-instruct:free',
      'google/gemma-2-9b-it:free',
      'google/gemma-3-4b-it:free',
      'nousresearch/hermes-3-llama-3.1-8b:free',
    ];
    for (const model of freeModels) {
      try {
        console.log(`[ROUTER] Trying OpenRouter ${model}...`);
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://crucible.dev',
            'X-Title': 'Crucible AI Forge',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          }),
        });
        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status}: ${errBody.substring(0, 200)}`);
        }
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log(`[ROUTER] ✓ OpenRouter (${model}) succeeded`);
          return content;
        }
      } catch (e: any) {
        console.warn(`[ROUTER] ✗ OpenRouter (${model}): ${e.message?.substring(0, 120)}`);
        errors.push(`OpenRouter (${model}): ${e.message?.substring(0, 120)}`);
      }
    }
  }

  // ─── 8. Anthropic (Claude 3.5 Haiku, paid but low cost) ──────────────────
  if (anthropicKey) {
    try {
      console.log('[ROUTER] Trying Anthropic Claude 3.5 Haiku...');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${errBody.substring(0, 200)}`);
      }
      const data = await res.json();
      const content = data.content?.[0]?.text;
      if (content) {
        console.log('[ROUTER] ✓ Anthropic succeeded');
        return content;
      }
    } catch (e: any) {
      console.warn(`[ROUTER] ✗ Anthropic: ${e.message?.substring(0, 120)}`);
      errors.push(`Anthropic: ${e.message?.substring(0, 120)}`);
    }
  }

  throw new Error(`All AI providers exhausted. ${errors.join(' | ')}`);
}
