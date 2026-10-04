#!/usr/bin/env node
// Calls the Anthropic API to tailor the parsed resume's summary/bullets and
// draft a short cover note for one specific job posting, then writes a clean
// .docx (no Claude/Anthropic metadata or branding) + a plain-text cover note.
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_ROOT = path.join(__dirname, 'output', 'tailored');

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';

function slugify(text) {
  return (text || 'job')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

async function callAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set; required for tailor.mjs');
  }
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }
  const data = await res.json();
  const text = data.content?.map((c) => c.text || '').join('') || '';
  return text;
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not find JSON in model response');
  return JSON.parse(match[0]);
}

async function generateTailoredContent(resume, posting) {
  const prompt = `You are helping tailor a resume for a specific job application.
Base resume skills: ${resume.skills.join(', ')}
Base resume prior titles: ${resume.titles.join(', ')}
Base resume full text:
"""
${resume.rawText}
"""

Target job:
Title: ${posting.title}
Company: ${posting.company}
Description:
"""
${posting.description || ''}
"""

Return ONLY a JSON object with this exact shape, no other text:
{
  "summary": "3-4 sentence professional summary tailored to this job, based only on the candidate's real experience above, no fabrication",
  "bullets": ["reworded/reordered achievement bullet 1 emphasizing relevant skills", "..."],
  "coverNote": "a short (150-200 word) cover note tailored to this job"
}`;

  const raw = await callAnthropic(prompt);
  return extractJson(raw);
}

export async function writeTailoredDocx(outPath, candidateName, posting, tailored) {
  // Author fields are set to the candidate, not left at the docx library's
  // "Un-named" default and never to any tool/vendor name, so the file's
  // properties look like an ordinary personal document.
  const doc = new Document({
    creator: candidateName,
    lastModifiedBy: candidateName,
    title: `${candidateName} - ${posting.title}`,
    description: '',
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun(candidateName)],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun('Summary')],
          }),
          new Paragraph({ children: [new TextRun(tailored.summary)] }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun('Experience Highlights')],
          }),
          ...tailored.bullets.map(
            (b) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun(b)],
              }),
          ),
        ],
      },
    ],
  });
  const buffer = await Packer.toBuffer(doc);
  writeFileSync(outPath, buffer);
}

/**
 * @param {object} resume - parsed resume from resume-parser.mjs
 * @param {{id: string, title: string, company: string, description: string}} posting
 * @param {string} candidateName
 */
export async function tailorForPosting(resume, posting, candidateName) {
  const tailored = await generateTailoredContent(resume, posting);

  const jobDir = path.join(OUTPUT_ROOT, `${slugify(posting.company)}-${slugify(posting.title)}-${posting.id}`);
  mkdirSync(jobDir, { recursive: true });

  const docxPath = path.join(jobDir, 'resume.docx');
  const coverNotePath = path.join(jobDir, 'cover-note.txt');

  await writeTailoredDocx(docxPath, candidateName, posting, tailored);
  writeFileSync(coverNotePath, tailored.coverNote);

  return { docxPath, coverNotePath, summary: tailored.summary };
}
