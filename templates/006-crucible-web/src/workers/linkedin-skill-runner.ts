import { query, type Options } from '@anthropic-ai/claude-agent-sdk';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import { mkdtemp, cp, mkdir, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { getSupabaseAdmin } from '@/lib/supabase';
import { decryptCompanyCredentials, type CompanyCredentialsRow } from '@/lib/crypto/secrets';

// Runs one linkedin-* skill, once, for one company, non-interactively.
// See /Users/aak/.claude/plans/can-we-make-this-snappy-adleman.md §"Skill
// invocation mechanism" for the design rationale.
//
// Key facts this file relies on, verified against node_modules/@anthropic-ai/
// claude-agent-sdk/sdk.d.ts and the SDK's published docs (not assumed):
//   - `options.env`, when set, REPLACES the subprocess env entirely (it is
//     NOT merged with process.env) — this is the actual isolation boundary
//     between companies' credentials. We deliberately do NOT spread the
//     parent Node process's env (which holds this app's OWN secrets:
//     SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, CREDENTIALS_ENC_KEY,
//     etc.) into the child — only a minimal safe set plus this company's
//     decrypted per-skill secrets.
//   - Skills are discovered only from `.claude/skills/<name>/SKILL.md`
//     relative to `cwd` (or a parent, up to the repo root) — NOT from a bare
//     top-level `skills/` directory, which is how this repo's skills
//     actually live on disk. So the per-job workspace mirrors the two
//     skill directories it needs as siblings under `<workspace>/.claude/skills/`,
//     preserving the `../linkedin-skills-shared/...` relative-path
//     convention the skill markdown files already use.
//   - `settingSources: ['project']` (not `'user'`) loads only the ephemeral
//     workspace's `.claude/skills/`, not the host machine's `~/.claude/skills/`
//     — required so one worker host never leaks an operator's personal
//     skills/config into a customer's job.
//   - `permissionMode: 'dontAsk'` denies anything not in `allowedTools`
//     outright, with no interactive prompt (there is no human to prompt in a
//     headless job) — combined with the PreToolUse hook below as
//     defense-in-depth against the one dangerous action (an unattended
//     `lib.publish`/`lib.repost`/`lib.publish_comment` call).

const REPO_ROOT = path.resolve(process.cwd(), '..', '..'); // templates/006-crucible-web -> repo root
const SKILLS_SHARED_DIR = path.join(REPO_ROOT, 'skills', 'linkedin-skills-shared');

export interface SkillRunResult {
  ok: boolean;
  resultText: string;
  totalCostUsd: number;
  isError: boolean;
  draftJson: unknown | null; // parsed from the model's stop-before-publish JSON block, if present
}

const PUBLISH_CALL_PATTERN = /\blib\.(publish|repost|publish_comment)\s*\(/;

/** Denies any Bash call that looks like it's about to actually call the
 * skill's publish/repost/comment functions — the prompt already instructs
 * the model to stop before this point and emit a draft JSON block instead,
 * this hook is the enforced backstop in case the model doesn't comply. */
const preventUnattendedPublish: NonNullable<Options['hooks']> = {
  PreToolUse: [
    {
      hooks: [
        async (input: unknown) => {
          const toolInput = (input as { tool_name?: string; tool_input?: unknown })?.tool_input;
          const command =
            typeof toolInput === 'object' && toolInput !== null && 'command' in toolInput
              ? String((toolInput as { command?: unknown }).command ?? '')
              : '';
          if (PUBLISH_CALL_PATTERN.test(command)) {
            return {
              continue: true,
              hookSpecificOutput: {
                hookEventName: 'PreToolUse',
                permissionDecision: 'deny',
                permissionDecisionReason:
                  'This session runs headlessly for an automation product. Publishing is a separate, ' +
                  'human-approved step — emit the draft JSON block instead of calling publish/repost.',
              },
            };
          }
          return { continue: true };
        },
      ],
    },
  ],
};

function renderVoiceProfileMarkdown(profile: {
  filled: boolean;
  voice_fingerprint: string | null;
  icp: string | null;
  hard_rules: string | null;
  cta_style: string | null;
  brand_handle: string | null;
  brand_color: string | null;
  brand_logo_url: string | null;
} | null): string {
  // Mirrors the field layout of skills/linkedin-skills-shared/references/voice-profile.md
  // so the skill files (which read this file unmodified) see the same shape
  // whether it's the solo user's static file or this generated one.
  if (!profile || !profile.filled) {
    return ['## Status', '- filled: no', '- source: template', '- updated: --'].join('\n');
  }
  return [
    '## Status',
    '- filled: yes',
    '- source: company_voice_profiles',
    `- updated: ${new Date().toISOString()}`,
    '',
    '## Voice fingerprint',
    profile.voice_fingerprint ?? '',
    '',
    '## ICP',
    profile.icp ?? '',
    '',
    '## Hard rules',
    profile.hard_rules ?? '',
    '',
    '## CTA style',
    profile.cta_style ?? '',
    '',
    '## Brand assets',
    `- Handle: ${profile.brand_handle ?? ''}`,
    `- Color: ${profile.brand_color ?? ''}`,
    `- Logo: ${profile.brand_logo_url ?? ''}`,
  ].join('\n');
}

/** Copies the target skill dir + the shared layer into an ephemeral
 * `.claude/skills/` workspace, writing a company-specific voice-profile.md
 * over the shared copy. Caller MUST delete the returned dir when done
 * (wrap in try/finally) — it briefly holds this company's voice profile and
 * is created with a random name under the OS temp dir, not the repo. */
async function materializeJobWorkspace(companyId: string, skillName: string): Promise<string> {
  const workDir = await mkdtemp(path.join(tmpdir(), `linkedin-job-${companyId}-`));
  const skillsDir = path.join(workDir, '.claude', 'skills');
  await mkdir(skillsDir, { recursive: true });

  const sourceSkillDir = path.join(REPO_ROOT, 'skills', skillName);
  await cp(sourceSkillDir, path.join(skillsDir, skillName), { recursive: true });
  await cp(SKILLS_SHARED_DIR, path.join(skillsDir, 'linkedin-skills-shared'), { recursive: true });

  const supabase = getSupabaseAdmin();
  const { data: voiceProfile } = await supabase
    .from('company_voice_profiles')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  await writeFile(
    path.join(skillsDir, 'linkedin-skills-shared', 'references', 'voice-profile.md'),
    renderVoiceProfileMarkdown(voiceProfile)
  );

  return workDir;
}

function extractDraftJson(resultText: string): unknown | null {
  const match = resultText.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null; // malformed JSON from the model — caller treats draftJson as absent, not a crash
  }
}

/** Runs `skillName` for `companyId` with `jobInput` as the task description.
 * Never calls Publora/publishes anything itself — the skill is instructed to
 * stop and emit a draft JSON block, which the caller writes to
 * `content_drafts` for human approval (see the approvals dashboard). */
export async function runSkillForCompany(
  companyId: string,
  skillName: string,
  jobInput: string
): Promise<SkillRunResult> {
  const supabase = getSupabaseAdmin();
  const { data: credsRow, error: credsErr } = await supabase
    .from('company_credentials')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();
  if (credsErr || !credsRow) {
    throw new Error(`No credentials row for company ${companyId}: ${credsErr?.message ?? 'not found'}`);
  }
  const creds = decryptCompanyCredentials(credsRow as CompanyCredentialsRow);
  if (!creds.publoraApiKey || !creds.linkedinPlatformId) {
    throw new Error(`Company ${companyId} has no Publora credentials configured yet`);
  }

  const workDir = await materializeJobWorkspace(companyId, skillName);
  try {
    // Deliberately NOT `...process.env` — this app's own secrets
    // (SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, CREDENTIALS_ENC_KEY, the
    // NEXT app's ANTHROPIC_API_KEY aside) must never reach this subprocess.
    // ANTHROPIC_API_KEY IS included below because the CLI binary itself
    // needs it to authenticate to the Anthropic API — that's this product's
    // own cost to bear per job, tracked via skill_job_runs.cost_usd, not a
    // per-company secret.
    const jobEnv: Record<string, string> = {
      PATH: process.env.PATH ?? '',
      HOME: process.env.HOME ?? '',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
      PUBLORA_API_KEY: creds.publoraApiKey,
      LINKEDIN_PLATFORM_ID: creds.linkedinPlatformId,
      ...(creds.apifyToken && { APIFY_TOKEN: creds.apifyToken }),
      ...(creds.pixfaroToken && { PIXFARO_TOKEN: creds.pixfaroToken }),
      CLAUDE_AGENT_SDK_CLIENT_APP: 'crucible-linkedin-worker/1.0',
    };

    const prompt = [
      `Run the "${skillName}" skill for this task: ${jobInput}`,
      '',
      'You are running non-interactively for a multi-tenant automation product — there is no ' +
        'human in this chat to approve a draft. When you reach the point of calling ' +
        'lib.publish(...), lib.repost(...), or lib.publish_comment(...), STOP. Do not call it. ' +
        'Instead, output your final message as a single fenced ```json code block containing ' +
        '{"kind": ..., "draft_text": ..., "target_url": ..., "kwargs": {...}} with exactly the ' +
        'arguments you would have passed to that publish call. This JSON will be shown to a human ' +
        'for approval; make it complete enough to replay verbatim.',
    ].join('\n');

    const options: Options = {
      cwd: workDir,
      settingSources: ['project'],
      skills: [skillName],
      allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Skill'],
      permissionMode: 'dontAsk',
      env: jobEnv,
      hooks: preventUnattendedPublish,
      maxTurns: 30,
    };

    let resultText = '';
    let totalCostUsd = 0;
    let isError = false;
    for await (const message of query({ prompt, options })) {
      if (message.type === 'result') {
        resultText = (message as { result?: string }).result ?? '';
        totalCostUsd = (message as { total_cost_usd?: number }).total_cost_usd ?? 0;
        isError = (message as { is_error?: boolean }).is_error ?? false;
      }
    }

    return {
      ok: !isError,
      resultText,
      totalCostUsd,
      isError,
      draftJson: extractDraftJson(resultText),
    };
  } finally {
    // Ephemeral workspace held this company's decrypted voice profile and
    // briefly-materialized skill files — must not survive the job either
    // way (success or failure) to avoid cross-tenant leakage on a shared host.
    await rm(workDir, { recursive: true, force: true });
  }
}

export function newJobId(): string {
  return randomUUID();
}

// ---------------------------------------------------------------------------
// Deterministic publish replay — the approval step. Per the plan's stronger
// recommendation over a second LLM pass: this is a plain, non-LLM Python
// invocation of `lib.publish(**captured_kwargs)` with exactly the JSON a
// human already reviewed in the approvals dashboard, so "approve" can never
// diverge from what was shown. No Agent SDK / skill workspace needed here —
// only the shared lib's `publish()` dispatcher, run directly against the
// repo's `skills/linkedin-skills-shared` checkout (read-only import, no
// per-company file materialization required).

const REPLAY_PUBLISH_SCRIPT = `
import json, sys
sys.path.insert(0, ${JSON.stringify(SKILLS_SHARED_DIR)})
from lib import publish
with open(sys.argv[1]) as f:
    payload = json.load(f)
kwargs = payload.get("kwargs") or {}
result = publish(kind=payload["kind"], draft_text=payload["draft_text"], target_url=payload.get("target_url"), **kwargs)
print(json.dumps({"ok": True, "result": result}))
`;

export interface ReplayPublishResult {
  ok: boolean;
  result?: unknown;
  error?: string;
}

/** Executes the approved publish_payload for one content_drafts row. Caller
 * (the approve API route) is responsible for checking draft.status is still
 * 'pending' before calling this, and for updating status afterward. */
export async function replayPublish(
  companyId: string,
  publishPayload: { kind: string; draft_text: string; target_url?: string; kwargs?: Record<string, unknown> }
): Promise<ReplayPublishResult> {
  const supabase = getSupabaseAdmin();
  const { data: credsRow, error: credsErr } = await supabase
    .from('company_credentials')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();
  if (credsErr || !credsRow) {
    return { ok: false, error: `No credentials for company ${companyId}` };
  }
  const creds = decryptCompanyCredentials(credsRow as CompanyCredentialsRow);
  if (!creds.publoraApiKey || !creds.linkedinPlatformId) {
    return { ok: false, error: 'Company has no Publora credentials configured' };
  }

  const payloadPath = path.join(await mkdtemp(path.join(tmpdir(), `linkedin-publish-${companyId}-`)), 'payload.json');
  await writeFile(payloadPath, JSON.stringify(publishPayload));

  try {
    const jobEnv: Record<string, string | undefined> = {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      PUBLORA_API_KEY: creds.publoraApiKey,
      LINKEDIN_PLATFORM_ID: creds.linkedinPlatformId,
      ...(creds.apifyToken && { APIFY_TOKEN: creds.apifyToken }),
      ...(creds.pixfaroToken && { PIXFARO_TOKEN: creds.pixfaroToken }),
    };

    const output = await new Promise<string>((resolve, reject) => {
      const proc = spawn('python3', ['-c', REPLAY_PUBLISH_SCRIPT, payloadPath], {
        env: jobEnv as NodeJS.ProcessEnv,
      });
      let stdout = '';
      let stderr = '';
      proc.stdout.on('data', (d) => (stdout += d.toString()));
      proc.stderr.on('data', (d) => (stderr += d.toString()));
      proc.on('close', (code) => {
        if (code === 0) resolve(stdout);
        else reject(new Error(stderr || `python3 exited with code ${code}`));
      });
      proc.on('error', reject);
    });

    const parsed = JSON.parse(output.trim().split('\n').pop() ?? '{}');
    return { ok: true, result: parsed.result };
  } catch (err: any) {
    return { ok: false, error: String(err?.message ?? err).slice(0, 2000) };
  } finally {
    await rm(path.dirname(payloadPath), { recursive: true, force: true });
  }
}
