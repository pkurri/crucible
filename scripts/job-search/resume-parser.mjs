#!/usr/bin/env node
// Parses the canonical base resume (.docx) into structured JSON used by
// matcher.mjs and tailor.mjs. Re-parses only when the source file changes.
import { existsSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'output');
const CACHE_PATH = path.join(OUTPUT_DIR, 'resume-parsed.json');

export const BASE_RESUME_PATH =
  process.env.BASE_RESUME_PATH ||
  path.join(process.env.HOME || '', 'Downloads', 'Resume_09_25.docx');

const SECTION_HEADERS = [
  'summary',
  'professional summary',
  'experience',
  'work experience',
  'professional experience',
  'skills',
  'technical skills',
  'technical proficiencies',
  'proficiencies',
  'core competencies',
  'education',
  'certifications',
  'projects',
];

const SKILL_SECTIONS = [
  'skills',
  'technical skills',
  'technical proficiencies',
  'proficiencies',
  'core competencies',
];

const DATE_RANGE_RE =
  /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?[a-z]*\.?\s*(\d{4})\s*[-–—to]+\s*(present|current|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?[a-z]*\.?\s*(\d{4}))/gi;

function normalizeToken(token) {
  return token.toLowerCase().replace(/[^a-z0-9+.#]/g, '').trim();
}

function splitSections(lines) {
  const sections = {};
  let current = 'header';
  sections[current] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const lower = line.toLowerCase().replace(/[:.]+$/, '');
    const matchedHeader = SECTION_HEADERS.find((h) => lower === h);
    if (matchedHeader) {
      current = matchedHeader;
      if (!sections[current]) sections[current] = [];
      continue;
    }
    sections[current].push(line);
  }
  return sections;
}

// Splits on commas/pipes/bullets that sit at parenthesis depth 0, so an entry
// like "AI Gateway Management (Model Routing, Cost Attribution)" stays whole
// instead of fragmenting on its inner commas.
function splitTopLevel(line) {
  const parts = [];
  let depth = 0;
  let buf = '';
  for (const ch of line) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);

    if (depth === 0 && (ch === ',' || ch === '|' || ch === '•' || ch === '·')) {
      parts.push(buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  parts.push(buf);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function extractSkills(sections) {
  const skillLines = SKILL_SECTIONS.flatMap((name) => sections[name] || []);
  const skills = new Set();
  for (const line of skillLines) {
    // Lines are usually "Category: skill, skill, skill" — drop the category
    // label so it doesn't become a bogus skill entry.
    const withoutLabel = line.replace(/^[^:]{2,60}:\s*/, '');
    for (const part of splitTopLevel(withoutLabel)) {
      if (part.length > 1 && part.length < 60) skills.add(part);
    }
  }
  return [...skills];
}

// Application forms validate URL fields, so bare domains become https URLs.
const toUrl = (s) => (!s ? '' : /^https?:\/\//i.test(s) ? s : `https://${s}`);

function extractContact(headerLines) {
  const text = headerLines.join(' \n ');
  const pick = (re) => (text.match(re) || [])[0] || '';
  // Match the portfolio by the "Portfolio:" label when present; otherwise the
  // first bare domain that isn't LinkedIn/GitHub. Domains preceded by "@" are
  // excluded so the email's domain can't be mistaken for it.
  const labeled = (text.match(/Portfolio:\s*(\S+)/i) || [])[1];
  const bare = [...text.matchAll(/(?<![@\w.])([\w-]+(?:\.[\w-]+)+\.(?:app|com|dev|io|me|site))\b/g)]
    .map((m) => m[1])
    .find((d) => !/linkedin\.com|github\.com|gmail\.com/i.test(d));
  return {
    name: headerLines[0] || '',
    email: pick(/[\w.+-]+@[\w-]+\.[\w.]+/),
    phone: pick(/(\+?\d{1,2}[\s-])?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/),
    linkedin: toUrl(pick(/linkedin\.com\/in\/[\w-]+/)),
    github: toUrl(pick(/github\.com\/[\w-]+/)),
    portfolio: toUrl(labeled || bare || ''),
  };
}

function extractTitlesAndYears(sections) {
  const expLines = [
    ...(sections['experience'] || []),
    ...(sections['work experience'] || []),
    ...(sections['professional experience'] || []),
  ];
  const titles = new Set();
  let totalMonths = 0;
  const currentYear = new Date().getFullYear();

  for (const line of expLines) {
    // Heuristic: a line with a date range likely marks a role/company line.
    const dateMatches = [...line.matchAll(DATE_RANGE_RE)];
    if (dateMatches.length) {
      for (const m of dateMatches) {
        const startYear = parseInt(m[2], 10);
        const endToken = m[3];
        const endYear = /present|current/i.test(endToken)
          ? currentYear
          : parseInt(endToken.match(/\d{4}/)?.[0] || startYear, 10);
        if (startYear && endYear && endYear >= startYear) {
          totalMonths += (endYear - startYear) * 12;
        }
      }
      // Role lines look like "Title | Company (Location)  Dates" or
      // "Title | Dates"; the title is whatever precedes the first pipe.
      const title = line.replace(DATE_RANGE_RE, '').split('|')[0].replace(/[-–—\s]+$/, '').trim();
      if (title.length > 2 && title.length < 80) {
        titles.add(title);
      }
    }
  }

  return {
    titles: [...titles].filter(Boolean),
    estimatedYearsExperience: Math.round(totalMonths / 12),
  };
}

function buildKeywords(skills, titles, headerLines) {
  const tokens = new Set();
  for (const s of [...skills, ...titles, ...headerLines]) {
    for (const word of s.split(/\s+/)) {
      const norm = normalizeToken(word);
      if (norm.length > 1) tokens.add(norm);
    }
  }
  return [...tokens];
}

export async function parseResume(resumePath = BASE_RESUME_PATH) {
  if (!existsSync(resumePath)) {
    throw new Error(`Base resume not found at ${resumePath}`);
  }
  const mtimeMs = statSync(resumePath).mtimeMs;

  if (existsSync(CACHE_PATH)) {
    try {
      const cached = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
      if (cached.sourcePath === resumePath && cached.sourceMtimeMs === mtimeMs) {
        return cached;
      }
    } catch {
      // fall through and re-parse
    }
  }

  const { value: rawText } = await mammoth.extractRawText({ path: resumePath });
  const lines = rawText.split('\n');
  const sections = splitSections(lines);
  const skills = extractSkills(sections);
  const { titles, estimatedYearsExperience } = extractTitlesAndYears(sections);
  const keywords = buildKeywords(skills, titles, sections['header'] || []);
  const contact = extractContact(sections['header'] || []);

  const parsed = {
    sourcePath: resumePath,
    sourceMtimeMs: mtimeMs,
    parsedAt: new Date().toISOString(),
    rawText,
    contact,
    skills,
    titles,
    estimatedYearsExperience,
    keywords,
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(parsed, null, 2));
  return parsed;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  parseResume()
    .then((parsed) => {
      console.log(JSON.stringify(
        {
          sourcePath: parsed.sourcePath,
          contact: parsed.contact,
          skillCount: parsed.skills.length,
          skills: parsed.skills.slice(0, 15),
          titles: parsed.titles,
          estimatedYearsExperience: parsed.estimatedYearsExperience,
          keywordCount: parsed.keywords.length,
        },
        null,
        2,
      ));
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
