#!/usr/bin/env node
// Scores a job posting against a parsed resume. Pure heuristic keyword/title
// overlap — no network calls, no external deps.

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .split(/[^a-z0-9+.#]+/)
    .filter((t) => t.length > 1);
}

function tokenSet(text) {
  return new Set(normalize(text));
}

/**
 * @param {{title: string, company: string, location: string, description: string}} posting
 * @param {{skills: string[], titles: string[], keywords: string[], estimatedYearsExperience: number}} resume
 * @returns {{score: number, matchedKeywords: string[], reasons: string[]}}
 */
export function scorePosting(posting, resume) {
  const postingTokens = tokenSet(`${posting.title} ${posting.description || ''}`);
  const resumeKeywordSet = new Set(resume.keywords.map((k) => k.toLowerCase()));

  const matchedKeywords = [...resumeKeywordSet].filter((k) => postingTokens.has(k));
  // Saturating rather than proportional: a job description never restates an
  // entire resume, so dividing by total resume keywords would cap even a
  // perfect match far below 100. HALF_SATURATION is the match count that
  // scores 0.5 on this axis.
  const HALF_SATURATION = 12;
  const keywordCoverage =
    matchedKeywords.length / (matchedKeywords.length + HALF_SATURATION);

  const postingTitleTokens = tokenSet(posting.title);
  let titleOverlapBest = 0;
  const reasons = [];
  for (const t of resume.titles) {
    const titleTokens = tokenSet(t);
    if (titleTokens.size === 0) continue;
    const overlap = [...titleTokens].filter((tok) => postingTitleTokens.has(tok)).length;
    const ratio = overlap / titleTokens.size;
    if (ratio > titleOverlapBest) titleOverlapBest = ratio;
  }

  // Weighted blend: keyword coverage matters most, title similarity is a
  // strong secondary signal. Both normalized to 0-1 before blending.
  const blended = keywordCoverage * 0.65 + titleOverlapBest * 0.35;
  const score = Math.round(Math.min(1, blended) * 100);

  if (matchedKeywords.length) {
    reasons.push(`${matchedKeywords.length} skill/keyword matches`);
  }
  if (titleOverlapBest > 0) {
    reasons.push(`title overlaps an existing role (${Math.round(titleOverlapBest * 100)}%)`);
  }

  return { score, matchedKeywords, reasons };
}

/**
 * @param {Array} postings
 * @param {object} resume
 * @param {number} threshold - minimum score (0-100) to keep
 */
export function rankPostings(postings, resume, threshold = 55) {
  return postings
    .map((posting) => ({ posting, ...scorePosting(posting, resume) }))
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score);
}
