import { GoogleGenAI } from '@google/genai';
import { generateWithYield } from './ai-router.js';

/**
 * Competitor Research Agent
 * This agent identifies similar platforms and analyzes their pricing models
 * to provide context for the Revenue Agent.
 */

export async function getCompetitorContext() {
  console.log('🔍 Market Researcher: Identifying competitors...');
  
  // Note: In a production environment, this would use Puppeteer/Search API 
  // to find current market leaders in "AI Agent Orchestration" or "Genkit Templates".
  // For this demonstration, we'll use the AI to simulate the research results 
  // based on its pre-existing training data of the SaaS market.

  const researchPrompt = `
    Identify 3 competitors for a product that offers:
    - Next.js templates for AI Agents
    - Genkit orchestration workers
    - Automated infographic generation
    - Multi-LLM Routing
    
    For each competitor, provide:
    1. Name
    2. Primary pricing model (e.g., $19/mo, Free tier, etc.)
    3. Key differentiator
    
    Return the result as a raw JSON array of objects.
  `;

  try {
    const researchRaw = await generateWithYield(researchPrompt, 'general');
    const cleaned = researchRaw.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Market Research Error:', err);
    return [];
  }
}
