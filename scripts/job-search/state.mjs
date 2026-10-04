#!/usr/bin/env node
// Shared state file: scripts/job-search-state.json (gitignored). Tracks every
// job ever seen, its status, and dedupes across cycles.
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const STATE_PATH = path.join(__dirname, '..', 'job-search-state.json');

export function loadState() {
  if (!existsSync(STATE_PATH)) {
    return { jobs: {} };
  }
  return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
}

export function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export function upsertJob(state, job) {
  state.jobs[job.id] = { ...state.jobs[job.id], ...job };
}

export function listByStatus(state, status) {
  return Object.values(state.jobs).filter((j) => j.status === status);
}
