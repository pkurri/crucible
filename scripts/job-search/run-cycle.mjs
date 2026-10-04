#!/usr/bin/env node
// The unattended half of the pipeline: parse resume -> search all configured
// sources -> score -> tailor top new matches -> record as pending_approval.
// Safe to run on a schedule; never applies to anything.
//
// Usage: node scripts/job-search/run-cycle.mjs [--location "City, ST"]
import { parseResume } from './resume-parser.mjs';
import { rankPostings } from './matcher.mjs';
import { tailorForPosting } from './tailor.mjs';
import { loadState, saveState, upsertJob, listByStatus } from './state.mjs';
import { searchLinkedIn } from './job-sources/linkedin-source.mjs';
import { fetchJobrightMatches } from './job-sources/jobright-source.mjs';
import { searchAdzuna } from './job-sources/adzuna-source.mjs';
import { searchJSearch } from './job-sources/jsearch-source.mjs';

const CANDIDATE_NAME = process.env.CANDIDATE_NAME || 'Prasad Kurri';
const MATCH_THRESHOLD = Number(process.env.MATCH_THRESHOLD || 55);
const MAX_NEW_TAILORED_PER_CYCLE = 5;

function deriveSearchKeywords(resume) {
  const primaryTitle = resume.titles[0] || '';
  const topSkills = resume.skills.slice(0, 4).join(' ');
  return [primaryTitle, topSkills].filter(Boolean).join(' ').trim() || 'software engineer';
}

async function gatherPostings(keywords, location) {
  const sourceCalls = [
    ['linkedin', () => searchLinkedIn({ keywords, location })],
    ['jobright', () => fetchJobrightMatches()],
    ['adzuna', () => searchAdzuna({ keywords, location })],
    ['jsearch', () => searchJSearch({ keywords, location })],
  ];

  const settled = await Promise.allSettled(sourceCalls.map(([, fn]) => fn()));
  const postings = [];
  settled.forEach((res, i) => {
    const [name] = sourceCalls[i];
    if (res.status === 'fulfilled') {
      postings.push(...res.value);
    } else {
      console.warn(`[run-cycle] source "${name}" failed: ${res.reason?.message || res.reason}`);
    }
  });
  return postings;
}

export async function runCycle({ location = '' } = {}) {
  const resume = await parseResume();
  const keywords = deriveSearchKeywords(resume);

  const postings = await gatherPostings(keywords, location);

  const state = loadState();
  const unseen = postings.filter((p) => !state.jobs[p.id]);

  const ranked = rankPostings(unseen, resume, MATCH_THRESHOLD);
  const toTailor = ranked.slice(0, MAX_NEW_TAILORED_PER_CYCLE);

  const newlyPending = [];
  for (const { posting, score, matchedKeywords, reasons } of toTailor) {
    try {
      const tailored = await tailorForPosting(resume, posting, CANDIDATE_NAME);
      const record = {
        ...posting,
        status: 'pending_approval',
        score,
        matchedKeywords,
        reasons,
        tailoredResumePath: tailored.docxPath,
        coverNotePath: tailored.coverNotePath,
        tailoredSummary: tailored.summary,
        discoveredAt: new Date().toISOString(),
      };
      upsertJob(state, record);
      newlyPending.push(record);
    } catch (err) {
      console.warn(`[run-cycle] tailoring failed for ${posting.id}: ${err.message}`);
    }
  }

  // Record everything else seen (below threshold or beyond the per-cycle cap)
  // so it's not re-scored/re-tailored every cycle.
  for (const { posting, score } of ranked.slice(MAX_NEW_TAILORED_PER_CYCLE)) {
    upsertJob(state, { ...posting, status: 'below_cap', score });
  }
  for (const posting of unseen.filter((p) => !ranked.find((r) => r.posting.id === p.id))) {
    upsertJob(state, { ...posting, status: 'below_threshold' });
  }

  saveState(state);

  return {
    totalPostingsSeen: postings.length,
    newPendingApproval: newlyPending,
    pendingApprovalCount: listByStatus(state, 'pending_approval').length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const locationIdx = process.argv.indexOf('--location');
  const location = locationIdx !== -1 ? process.argv[locationIdx + 1] : '';
  runCycle({ location })
    .then((summary) => {
      console.log(JSON.stringify(summary, null, 2));
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
