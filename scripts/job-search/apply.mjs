#!/usr/bin/env node
// Interactive-only: fills (and, for LinkedIn/Jobright, submits) one approved
// job application using Playwright attached to the user's real Chrome
// session. NEVER invoked from the scheduled/unattended cycle — only when the
// user has explicitly approved a specific job in a live Claude Code session.
//
// External company ATS pages always stop before the final submit click and
// return a screenshot for the user to confirm, since third-party forms vary
// far more than LinkedIn/Jobright's own flows.
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToUserChrome } from './browser.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, 'output', 'screenshots');

const NEXT_BUTTON_RE = /^(next|continue|review)$/i;
const SUBMIT_BUTTON_RE = /^(submit application|submit|apply now|easy apply|apply)$/i;
const MAX_STEPS = 8;

async function uploadResumeIfPresent(page, resumePath) {
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.setInputFiles(resumePath);
    await page.waitForTimeout(1000);
    return true;
  }
  return false;
}

async function clickButtonMatching(page, re) {
  const buttons = await page.$$('button, [role="button"]');
  for (const btn of buttons) {
    const text = (await btn.innerText().catch(() => '')).trim();
    if (re.test(text)) {
      await btn.click().catch(() => {});
      return text;
    }
  }
  return null;
}

/**
 * @param {{id: string, source: 'linkedin'|'jobright'|'adzuna'|'jsearch', url: string}} job
 * @param {string} tailoredResumePath
 * @param {{autoSubmit?: boolean}} options
 */
export async function applyToJob(job, tailoredResumePath, options = {}) {
  const autoSubmit = options.autoSubmit ?? (job.source === 'linkedin' || job.source === 'jobright');
  const { browser, context } = await connectToUserChrome();
  const page = await context.newPage();
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const result = { jobId: job.id, submitted: false, screenshotPath: null, notes: [] };

  try {
    await page.goto(job.url, { waitUntil: 'domcontentloaded' });

    if (job.source === 'linkedin') {
      await clickButtonMatching(page, /^easy apply$/i);
      await page.waitForTimeout(1500);
    } else if (job.source === 'jobright') {
      await clickButtonMatching(page, /^(quick apply|apply)$/i);
      await page.waitForTimeout(1500);
    }

    const uploaded = await uploadResumeIfPresent(page, tailoredResumePath);
    if (uploaded) result.notes.push('tailored resume uploaded');

    for (let step = 0; step < MAX_STEPS; step++) {
      const clicked = await clickButtonMatching(page, NEXT_BUTTON_RE);
      if (!clicked) break;
      await page.waitForTimeout(1000);
      await uploadResumeIfPresent(page, tailoredResumePath);
    }

    const screenshotPath = path.join(SCREENSHOT_DIR, `${job.id}-before-submit.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshotPath = screenshotPath;

    if (!autoSubmit) {
      result.notes.push(
        'External/uncertain ATS form: stopped before final submit. Review the ' +
          `screenshot at ${screenshotPath} and re-run with autoSubmit:true to finish.`,
      );
      return result;
    }

    const submitClicked = await clickButtonMatching(page, SUBMIT_BUTTON_RE);
    result.submitted = Boolean(submitClicked);
    if (!submitClicked) {
      result.notes.push('Could not find a submit button automatically; needs manual finish.');
    }
    return result;
  } finally {
    await page.close();
    await browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , jobJsonPath, resumePath, autoSubmitArg] = process.argv;
  if (!jobJsonPath || !resumePath) {
    console.error('Usage: node apply.mjs <job.json path> <tailored resume path> [autoSubmit=true|false]');
    process.exit(1);
  }
  const { readFileSync } = await import('fs');
  const job = JSON.parse(readFileSync(jobJsonPath, 'utf8'));
  applyToJob(job, resumePath, { autoSubmit: autoSubmitArg !== 'false' })
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
