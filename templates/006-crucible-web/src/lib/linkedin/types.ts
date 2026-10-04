// Shared between the API routes (enqueue side) and src/workers/linkedin-worker.ts
// (consume side) so job data can't drift between the two.

export type LinkedinJobType = 'weekly_content_batch' | 'daily_comment_check' | 'thread_monitor';

export const VALID_LINKEDIN_JOB_TYPES: LinkedinJobType[] = [
  'weekly_content_batch',
  'daily_comment_check',
  'thread_monitor',
];

export interface LinkedinJobData {
  companyId: string;
  jobType: LinkedinJobType;
}
