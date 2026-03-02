import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ContentType = 'blog' | 'social' | 'marketing' | 'email' | 'ad';

export interface ContentRequest {
  type: ContentType;
  topic: string;
  tone?: 'professional' | 'casual' | 'humorous' | 'persuasive';
  length?: 'short' | 'medium' | 'long';
  targetAudience?: string;
  keywords?: string[];
}

const ContentSchema = z.object({
  title: z.string(),
  content: z.string(),
  metaDescription: z.string(),
  tags: z.array(z.string()),
  keyPoints: z.array(z.string()),
});

export async function generateContent(request: ContentRequest) {
  const prompts: Record<ContentType, string> = {
    blog: `Write a blog post about "${request.topic}". 
Tone: ${request.tone || 'professional'}
Length: ${request.length || 'medium'}
Target audience: ${request.targetAudience || 'general'}`,

    social: `Create social media content about "${request.topic}".
Platforms: Twitter, LinkedIn, Instagram
Tone: ${request.tone || 'casual'}
Include hashtags and engagement hooks.`,

    marketing: `Write marketing copy for "${request.topic}".
Tone: ${request.tone || 'persuasive'}
Focus on benefits and value proposition.
Include call-to-action.`,

    email: `Write an email about "${request.topic}".
Type: ${request.tone === 'professional' ? 'business' : 'newsletter'}
Include subject line options and body copy.`,

    ad: `Create ad copy for "${request.topic}".
Format: Google Ads + Facebook Ads
Headlines (3 variations)
Description (2 variations)
Call-to-action options`,
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert content marketer and copywriter.',
      },
      {
        role: 'user',
        content: `${prompts[request.type]}

Respond in JSON format:
{
  "title": "Content title",
  "content": "Full content text",
  "metaDescription": "SEO meta description",
  "tags": ["tag1", "tag2"],
  "keyPoints": ["Key point 1", "Key point 2"]
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  return ContentSchema.parse(JSON.parse(content));
}

export async function generateVariations(originalContent: string, count: number = 3) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Create variations of the given content with different angles.',
      },
      {
        role: 'user',
        content: `Create ${count} variations of this content with different angles:

${originalContent}

Respond as JSON array of objects with "angle" and "content" fields.`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = response.choices[0].message.content;
  if (!result) return [];

  const parsed = JSON.parse(result);
  return parsed.variations || [];
}
