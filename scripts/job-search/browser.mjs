#!/usr/bin/env node
// Shared helper: attach Playwright to the user's already-running, already
// logged-in Chrome instance via CDP, instead of launching a fresh automation
// profile. This is what lets linkedin-source.mjs / jobright-source.mjs /
// apply.mjs reuse existing LinkedIn/Jobright logins without ever touching a
// password.
//
// Prerequisite (one-time, per machine): the user's normal Chrome must be
// started with remote debugging enabled, e.g.:
//   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
//     --remote-debugging-port=9222
import { chromium } from 'playwright';

const CDP_ENDPOINT = process.env.CHROME_CDP_ENDPOINT || 'http://localhost:9222';

export async function connectToUserChrome() {
  let browser;
  try {
    browser = await chromium.connectOverCDP(CDP_ENDPOINT);
  } catch (err) {
    throw new Error(
      `Could not connect to Chrome at ${CDP_ENDPOINT}. Start Chrome with ` +
        `--remote-debugging-port=9222 and make sure you're logged into the ` +
        `sites this script needs. Original error: ${err.message}`,
    );
  }
  const context = browser.contexts()[0] || (await browser.newContext());
  return { browser, context };
}

export async function getOrOpenPage(context, urlSubstring) {
  const existing = context
    .pages()
    .find((p) => p.url().includes(urlSubstring));
  if (existing) return existing;
  return context.newPage();
}
