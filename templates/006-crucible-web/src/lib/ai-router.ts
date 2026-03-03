import { GoogleGenAI } from '@google/genai';

/**
 * Multi-Provider AI Router for API routes
 * Cycles through: Gemini → Groq → OpenRouter → Anthropic
 * Ensures article generation never halts due to rate limits.
 */
export async function generateText(prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  const errors: string[] = [];

  // 1. Gemini 2.5 Flash
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

  // 2. Groq (llama-3.3-70b-versatile — fast, generous free tier)
  if (groqKey) {
    try {
      console.log('[ROUTER] Trying Groq llama-3.3-70b-versatile...');
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${errBody.substring(0, 200)}`);
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        console.log('[ROUTER] ✓ Groq succeeded');
        return content;
      }
    } catch (e: any) {
      console.warn(`[ROUTER] ✗ Groq: ${e.message?.substring(0, 120)}`);
      errors.push(`Groq: ${e.message?.substring(0, 120)}`);
    }
  }

  // 3. OpenRouter (Cycles through Free Models — largest pool first)
  if (openRouterKey) {
    const freeModels = [
      // DeepSeek — excellent reasoning, free tier
      'deepseek/deepseek-chat:free',
      'deepseek/deepseek-r1:free',
      // Kimi (Moonshot AI) — strong instruction following
      'moonshotai/moonshot-v1-8k:free',
      // Meta Llama family
      'meta-llama/llama-3.1-8b-instruct:free',
      'meta-llama/llama-3-8b-instruct:free',
      // Mistral family
      'mistralai/mistral-7b-instruct:free',
      'mistralai/mistral-small-3.1-24b-instruct:free',
      // Microsoft Phi-3
      'microsoft/phi-3-mini-128k-instruct:free',
      'microsoft/phi-3-medium-128k-instruct:free',
      // Qwen (Alibaba)
      'qwen/qwen-2-7b-instruct:free',
      'qwen/qwen2.5-7b-instruct:free',
      // Google Gemma
      'google/gemma-2-9b-it:free',
      'google/gemma-3-4b-it:free',
      // Others
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
            model: model,
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

  // 4. Anthropic (Claude 3.5 Haiku)
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
