import { GoogleGenAI } from '@google/genai';

/**
 * Multi-API Fallback Router
 * Purpose: Ensures the Autonomous Engine never halts due to rate limits (429s).
 * Strategy: Round-robin through available free tier AI providers.
 */
export async function generateWithYield(systemPrompt: string): Promise<string> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    let errors: any[] = [];

    // 1. Primary: Gemini 2.5 Flash
    if (geminiKey) {
        try {
            console.log(`\x1b[36m[ROUTER]\x1b[0m Attempting Primary Engine (Gemini 2.5 Flash)...`);
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: systemPrompt,
            });
            if (response.text) return response.text;
        } catch (e: any) {
            console.warn(`\x1b[33m[ROUTER WAIT]\x1b[0m Gemini failed (${e.message}). Yielding to fallback...`);
            errors.push(e);
        }
    }

    // 2. Fallback: Groq LLaMA-3 (Extremely fast, free tier)
    if (groqKey) {
        try {
            console.log(`\x1b[35m[ROUTER]\x1b[0m Attempting Fallback Alpha (Groq LLaMA-3 70B)...`);
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama3-70b-8192',
                    messages: [{ role: 'user', content: systemPrompt }],
                    temperature: 0.7
                })
            });
            if (!res.ok) throw new Error(`Groq HTTP error: ${res.status}`);
            const data = await res.json();
            if (data.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
        } catch (e: any) {
            console.warn(`\x1b[33m[ROUTER WAIT]\x1b[0m Groq failed (${e.message}). Yielding to next...`);
            errors.push(e);
        }
    }

    // 3. Fallback: OpenRouter (Free tier models)
    if (openRouterKey) {
        try {
            console.log(`\x1b[35m[ROUTER]\x1b[0m Attempting Fallback Beta (OpenRouter Liquid)...`);
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'liquid/lfm-40b:free', // Using a high-quality free model
                    messages: [{ role: 'user', content: systemPrompt }],
                })
            });
            if (!res.ok) throw new Error(`OpenRouter HTTP error: ${res.status}`);
            const data = await res.json();
            if (data.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
        } catch (e: any) {
             console.warn(`\x1b[33m[ROUTER WAIT]\x1b[0m OpenRouter failed (${e.message}). Yielding to next...`);
             errors.push(e);
        }
    }

    // 4. Fallback: Anthropic (Claude 3 Haiku)
    if (anthropicKey) {
        try {
            console.log(`\x1b[35m[ROUTER]\x1b[0m Attempting Fallback Gamma (Anthropic Claude 3 Haiku)...`);
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': anthropicKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 4000,
                    messages: [{ role: 'user', content: systemPrompt }]
                })
            });
            if (!res.ok) throw new Error(`Anthropic HTTP error: ${res.status}`);
            const data = await res.json();
            if (data.content?.[0]?.text) {
                return data.content[0].text;
            }
        } catch (e: any) {
             console.warn(`\x1b[33m[ROUTER WAIT]\x1b[0m Anthropic failed (${e.message}).`);
             errors.push(e);
        }
    }

    throw new Error(`All available AI Router paths exhausted. Errors: ${errors.map(e => e.message).join(' | ')}`);
}
