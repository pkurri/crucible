import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CodeReviewSchema = z.object({
  summary: z.string(),
  issues: z.array(z.object({
    severity: z.enum(['high', 'medium', 'low']),
    category: z.enum(['bug', 'security', 'performance', 'style']),
    line: z.number().optional(),
    message: z.string(),
    suggestion: z.string(),
  })),
});

export type CodeReviewResult = z.infer<typeof CodeReviewSchema>;

export async function analyzeCode(
  code: string,
  language: string,
  filePath: string
): Promise<CodeReviewResult> {
  const prompt = `You are an expert code reviewer. Analyze the following ${language} code and provide structured feedback.

File: ${filePath}

Code:
\`\`\`${language}
${code}
\`\`\`

Analyze for:
1. Bugs and logical errors
2. Security vulnerabilities
3. Performance issues
4. Code style and best practices

Respond in JSON format:
{
  "summary": "Brief summary of findings",
  "issues": [
    {
      "severity": "high|medium|low",
      "category": "bug|security|performance|style",
      "line": 42,
      "message": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a senior software engineer conducting code reviews. Be thorough but constructive.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  const parsed = JSON.parse(content);
  return CodeReviewSchema.parse(parsed);
}

export async function analyzePullRequest(
  files: Array<{ path: string; content: string; language: string }>
): Promise<CodeReviewResult> {
  const allIssues: CodeReviewResult['issues'] = [];
  let combinedSummary = '';

  for (const file of files) {
    try {
      const result = await analyzeCode(file.content, file.language, file.path);
      allIssues.push(...result.issues.map(issue => ({
        ...issue,
        filePath: file.path,
      })));
      
      if (result.issues.length > 0) {
        combinedSummary += `${file.path}: ${result.issues.length} issues found. `;
      }
    } catch (error) {
      console.error(`Error analyzing ${file.path}:`, error);
    }
  }

  return {
    summary: combinedSummary || 'No major issues found',
    issues: allIssues,
  };
}
