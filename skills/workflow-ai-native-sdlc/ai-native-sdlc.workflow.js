/* eslint-disable no-undef */
// ai-native-sdlc — the AI-native SDLC playbook as a runnable workflow, for any repo.
//
// Source: crucible skills/workflow-ai-native-sdlc/ai-native-sdlc.workflow.js (installed by install-claude-skills.sh)
// Playbook: https://academy.claude.com/courses/ai-native-sdlc-playbook
//   Plan (INTENT.md) → Design → Build → Test → Deploy (review, hooks as gates) → Maintain
//   (a metric or report becomes a new intent). The companion skill holds the templates and
//   the how-to: ~/.claude/skills/workflow-ai-native-sdlc/SKILL.md.
//
// Modes (args.mode):
//   audit     — score the repo's readiness for the playbook, stage by stage. Writes nothing.
//   bootstrap — create or bring up to date INTENT.md + CLAUDE.md + docs/intents/. Works on
//               an existing repo (reads code, docs, history) or a new one (args.idea).
//               Never commits; leaves the files for a human to review.
//   feature   — one change, from request to reviewed branch. Stops after Design by default
//               so a human approves the intent and plan; re-run with args.intentPath to build.
//   maintain  — turn a production signal (metric, incident, user report) into a new
//               feature intent, grounded in evidence. Feed its output to feature mode.
//
// Args (pass as JSON values, not a string):
//   mode        'audit' | 'bootstrap' | 'feature' | 'maintain'                  (required)
//   repo        absolute path to the repository                                  (required)
//   today       'YYYY-MM-DD' — scripts can't read the clock          (bootstrap/feature/maintain)
//   idea        bootstrap on a new/empty repo: what the product is and who it is for
//   request     feature: what to change, in the user's words
//   intentPath  feature: an approved docs/intents/*.md to build from (skips Intent + Design)
//   stopAfter   feature: 'intent' | 'design' | 'build' | 'test' | 'review' | 'ship'
//               (default 'design', or 'review' when intentPath is given)
//   base        feature: base branch for the work branch (default: the repo's current branch)
//   openPr      feature: true lets Ship push the branch and open a PR. Never merges.
//   signal      maintain: the metric/incident/report, with whatever evidence you have
//   templates   override the templates directory
//               (default ~/.claude/skills/workflow-ai-native-sdlc/templates)

export const meta = {
  name: 'ai-native-sdlc',
  description: 'AI-native SDLC playbook for any repo: audit readiness, bootstrap INTENT.md + CLAUDE.md, run a feature from intent to reviewed branch, or turn a production signal into a new intent',
  whenToUse: 'Pass args {mode: audit|bootstrap|feature|maintain, repo, today, ...}. See ~/.claude/skills/workflow-ai-native-sdlc/SKILL.md for each mode.',
  phases: [
    { title: 'Audit', detail: 'one agent scores the repo against each playbook stage' },
    { title: 'Recon', detail: 'four parallel readers: commands and verification, architecture, product intent, risks and gates' },
    { title: 'Write', detail: 'one agent writes or merges INTENT.md, CLAUDE.md and docs/intents/' },
    { title: 'Check', detail: 'adversarial check of every claim against the repo, then a fix pass' },
    { title: 'Intent', detail: 'feature intent written to docs/intents/, checked against INTENT.md' },
    { title: 'Design', detail: 'plan with a rejected alternative, appended to the intent' },
    { title: 'Build', detail: 'implements the approved plan on a work branch, commits locally' },
    { title: 'Test', detail: 'runs the Done-when checks and repo verification, up to two fix rounds' },
    { title: 'Review', detail: 'three lenses in parallel: correctness, security, intent and scope' },
    { title: 'Ship', detail: 'PR with intent, verification and review summary; never merges' },
    { title: 'Maintain', detail: 'investigate the signal, then write a new feature intent' },
  ],
}

// ─── Args ───────────────────────────────────────────────────────────────────
const A = args || {}
const MODES = ['audit', 'bootstrap', 'feature', 'maintain']
if (!MODES.includes(A.mode)) throw new Error(`ai-native-sdlc: args.mode must be one of ${MODES.join(', ')}`)
if (!A.repo || !String(A.repo).startsWith('/')) throw new Error('ai-native-sdlc: args.repo must be an absolute path')
if (A.mode !== 'audit' && !/^\d{4}-\d{2}-\d{2}$/.test(A.today || '')) {
  throw new Error("ai-native-sdlc: args.today is required as 'YYYY-MM-DD' (scripts cannot read the clock)")
}
if (A.mode === 'feature' && !A.request && !A.intentPath) throw new Error('ai-native-sdlc: feature mode needs args.request or args.intentPath')
if (A.mode === 'maintain' && !A.signal) throw new Error('ai-native-sdlc: maintain mode needs args.signal')

const REPO = A.repo
const TPL = A.templates || '~/.claude/skills/workflow-ai-native-sdlc/templates'
const STAGES = ['intent', 'design', 'build', 'test', 'review', 'ship']
const STOP = A.stopAfter || (A.intentPath ? 'review' : 'design')
if (!STAGES.includes(STOP)) throw new Error(`ai-native-sdlc: args.stopAfter must be one of ${STAGES.join(', ')}`)
const reach = (s) => STAGES.indexOf(s) <= STAGES.indexOf(STOP)

// Shared ground rules for every agent. The repo's own CLAUDE.md may not be the one the
// session loaded (the workflow can run from another directory), so point at it explicitly.
const GROUND = `
<ground_rules>
- Work only inside the repository at ${REPO}. cd there first. If it has a CLAUDE.md or INTENT.md, read them before anything else and follow them.
- State only what you verified with a tool (file read, grep, command output). Cite the path, path:line or command for each claim. If you could not verify something, say "unverified".
- Never: push to a remote, merge, force-push, deploy, run database seed/reset/migrate against anything but a local throwaway database, delete files you did not create, add dependencies, or touch secrets/.env values. Stop and report instead.
- Make only the changes this stage asks for.
</ground_rules>`

// ─── Schemas ────────────────────────────────────────────────────────────────
const str = { type: 'string' }
const strs = { type: 'array', items: str }
const FACTS = {
  type: 'object',
  properties: {
    facts: { type: 'array', items: { type: 'object', properties: { claim: str, evidence: str }, required: ['claim', 'evidence'] } },
    gaps: strs,
  },
  required: ['facts', 'gaps'],
}
const AUDIT = {
  type: 'object',
  properties: {
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stage: { type: 'string', enum: ['plan', 'design', 'build', 'test', 'deploy', 'maintain'] },
          item: str, status: { type: 'string', enum: ['pass', 'partial', 'missing'] }, evidence: str, fix: str,
        },
        required: ['stage', 'item', 'status', 'evidence', 'fix'],
      },
    },
    topFixes: strs,
  },
  required: ['checks', 'topFixes'],
}
const WROTE = {
  type: 'object',
  properties: { filesWritten: strs, staleFactsCorrected: strs, openQuestions: strs, hookCandidates: strs },
  required: ['filesWritten', 'openQuestions'],
}
const CHECK = {
  type: 'object',
  properties: {
    wrong: { type: 'array', items: { type: 'object', properties: { file: str, claim: str, why: str, fix: str }, required: ['file', 'claim', 'why', 'fix'] } },
    missing: strs,
  },
  required: ['wrong', 'missing'],
}
const INTENT = {
  type: 'object',
  properties: {
    path: str, slug: str, doneWhen: strs,
    conflicts: { type: 'array', items: str, description: 'INTENT.md non-negotiables this request would break; empty if none' },
    openQuestions: strs,
  },
  required: ['path', 'slug', 'doneWhen', 'conflicts', 'openQuestions'],
}
const DESIGN = {
  type: 'object',
  properties: { approach: str, rejected: str, files: strs, steps: strs, verification: strs, risks: strs },
  required: ['approach', 'files', 'steps', 'verification'],
}
const BUILD = {
  type: 'object',
  properties: { branch: str, commits: strs, filesChanged: strs, deviations: strs },
  required: ['branch', 'commits', 'filesChanged'],
}
const TEST = {
  type: 'object',
  properties: {
    passed: { type: 'boolean' },
    results: { type: 'array', items: { type: 'object', properties: { check: str, ok: { type: 'boolean' }, evidence: str }, required: ['check', 'ok', 'evidence'] } },
    notRun: strs,
  },
  required: ['passed', 'results', 'notRun'],
}
const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: { severity: { type: 'string', enum: ['high', 'medium', 'low'] }, file: str, line: { type: 'integer' }, issue: str, failureScenario: str, fix: str },
        required: ['severity', 'file', 'issue', 'failureScenario', 'fix'],
      },
    },
  },
  required: ['findings'],
}

// ─── Mode: audit ────────────────────────────────────────────────────────────
async function audit() {
  phase('Audit')
  return agent(`${GROUND}
Audit ${REPO} for readiness to work the AI-native SDLC way. Read-only: change nothing.

Check each item and give pass / partial / missing with evidence and the smallest fix:
- plan: INTENT.md (or equivalent) exists, says what/why/who, lists non-negotiables with their enforcement, is current with the code. A docs/intents/ (or equivalent) place for feature intents.
- design: decisions recorded somewhere durable (intents, ADRs, docs) rather than only in chat.
- build: CLAUDE.md exists, is short, accurate (spot-check 5 of its factual claims against the code), names the commands, invariants and dangerous commands. Project skills in .claude/skills for repeatable procedures.
- test: a one-command feedback loop (tests, typecheck, verify scripts) that an agent can run locally; CI runs it; evals for any LLM-backed behaviour.
- deploy: PRs are reviewed (by people and/or an AI review step); hooks in .claude/settings.json gate dangerous commands (pushes to protected branches, destructive DB/infra commands); deploy path documented.
- maintain: production metrics/alerts exist and there is a path from a metric to a new intent.

topFixes: the 3-5 changes with the most leverage, in order.`, { label: 'audit', phase: 'Audit', schema: AUDIT })
}

// ─── Mode: bootstrap ────────────────────────────────────────────────────────
async function bootstrap() {
  const templates = `Templates: ${TPL}/INTENT.md, ${TPL}/CLAUDE.md, ${TPL}/feature-intent.md, ${TPL}/hooks.md — read them and follow their structure.`

  if (A.idea) {
    // New project: nothing to read yet, so the intent comes from the idea.
    phase('Write')
    const wrote = await agent(`${GROUND}
${templates}
This is a new project at ${REPO}. The founding idea, in the owner's words:
<idea>
${A.idea}
</idea>
1. Write ${REPO}/INTENT.md from the INTENT template. Fill What/Why/Who/Non-negotiables/Constraints/Success/Out of scope from the idea only. Where the idea is silent, write the question under "Open decisions" — do not invent facts, users, numbers or stack choices. "What exists today": "Nothing yet." plus the first milestone the idea implies. Date it ${A.today}, "from the founding idea".
2. Write ${REPO}/CLAUDE.md from the CLAUDE template. Commands, Architecture and Deployment stay as clearly marked TODOs unless files in the repo already decide them.
3. Create ${REPO}/docs/intents/ with a copy of the feature-intent template as docs/intents/TEMPLATE.md.
4. hookCandidates: the gates from hooks.md this project will want once it has a deploy path.
Do not commit.`, { label: 'write:greenfield', phase: 'Write', schema: WROTE })
    return { mode: 'bootstrap', kind: 'new', ...wrote, next: 'Review INTENT.md and resolve its Open decisions before the first feature run.' }
  }

  // Existing project: read it from four independent angles, then write once.
  phase('Recon')
  const LENSES = [
    { key: 'commands', ask: 'How to install, run, build, typecheck, lint and test it — from package scripts, Makefiles, CI workflows, READMEs. Which checks CI runs. Which commands are dangerous or look right but are broken (try the cheap ones: e.g. --help, typecheck). What stands in for tests if there is no test framework.' },
    { key: 'architecture', ask: 'The invariants a newcomer cannot see from one file: sources of truth, the one function every write must go through, module boundaries, adapters/modes, auth and data-access rules. Look for comments that say "never", "must", "only" and for checks that enforce rules.' },
    { key: 'intent', ask: 'What the product is, why it exists, who uses it, what has shipped and what is decided — from README, docs/, existing INTENT/PRD/spec files, and the merged PR / commit subjects (git log --format=%s, newest 300). Name decisions that look locked (e.g. "owner\'s call", reverted approaches). List open decisions and anything that looks stale in existing docs.' },
    { key: 'risks', ask: 'Deploy path and environments; branches that are protected or deploy on merge; destructive commands (seeds, resets, migrations, infra apply, rsync --delete); secrets handling; existing .claude/settings.json hooks and .claude/skills. Propose hook candidates — rules that must never depend on memory.' },
  ]
  const recon = (await parallel(LENSES.map(l => () =>
    agent(`${GROUND}
Read-only reconnaissance of ${REPO}, lens: ${l.key}.
${l.ask}
Return facts with evidence (path, path:line or command) and the gaps you could not resolve.`,
      { label: `recon:${l.key}`, phase: 'Recon', schema: FACTS })
      .then(r => r && { lens: l.key, ...r })))).filter(Boolean)
  // Barrier is deliberate: the writer needs every lens at once to write one coherent pair of files.
  log(`Recon: ${recon.reduce((n, r) => n + r.facts.length, 0)} facts from ${recon.length}/${LENSES.length} lenses`)

  phase('Write')
  const wrote = await agent(`${GROUND}
${templates}
Bring ${REPO} up to the playbook: INTENT.md, CLAUDE.md, docs/intents/.
Evidence from four recon lenses (JSON):
<recon>
${JSON.stringify(recon)}
</recon>
Rules:
- INTENT.md: create it from the template, or if it exists, merge into it. "What exists today, and the intent behind it" covers each shipped capability and the decision behind it — intent, not a changelog. Non-negotiables only where the repo enforces or explicitly states them; cite the enforcing file. No invented numbers: unset targets say "not set yet". Date it ${A.today}.
- CLAUDE.md: if it exists, keep every still-true line. Correct only facts the evidence proves stale, and list each correction in staleFactsCorrected. Add what is missing from the template's sections (Read INTENT first; Verification feedback loop; How we work; Where knowledge goes). Keep it short — long-form material belongs in docs/.
- Create docs/intents/TEMPLATE.md from the feature-intent template if docs/intents/ does not exist.
- hookCandidates: concrete hooks from hooks.md this repo should add (do not add them).
Do not commit.`, { label: 'write', phase: 'Write', schema: WROTE })

  phase('Check')
  const check = await agent(`${GROUND}
Adversarially check the INTENT.md and CLAUDE.md just written in ${REPO}. Your job is to find what is wrong, not to approve.
For every factual claim (a path, command, count, rule, decision, enforcement point): verify it with a tool. List each claim that is false, unverifiable, or invented (e.g. a target number nobody set) under wrong, with the fix. Under missing, list important facts from the repo that a new engineer or agent would need and the files omit. Read-only.`,
    { label: 'check', phase: 'Check', schema: CHECK })

  let fixed = null
  if (check && check.wrong.length) {
    fixed = await agent(`${GROUND}
Apply these corrections to ${REPO}/INTENT.md and ${REPO}/CLAUDE.md. Re-verify each before editing; skip any you find is actually correct and say why. Add the "missing" items only where they are short and verified.
<corrections>
${JSON.stringify(check)}
</corrections>
Do not commit. Return a short list of what you changed and what you skipped.`, { label: 'fix', phase: 'Check' })
  }
  return { mode: 'bootstrap', kind: 'existing', wrote, check, fixed, next: 'Review the diff (git diff INTENT.md CLAUDE.md), answer openQuestions, consider hookCandidates, then commit.' }
}

// ─── Mode: feature ──────────────────────────────────────────────────────────
async function feature() {
  let intent = null
  let design = null
  let intentPath = A.intentPath

  if (!intentPath) {
    phase('Intent')
    intent = await agent(`${GROUND}
Write a feature intent for this request in ${REPO}:
<request>
${A.request}
</request>
Read ${REPO}/INTENT.md first (if missing, note it in openQuestions and continue). Use ${TPL}/feature-intent.md. Save it as ${REPO}/docs/intents/${A.today}-<slug>.md, status draft.
- Ground What/Why/Who in the request and the code you read. Don't invent evidence: if the request gives no why, say so in Open questions.
- Done when: binary checks, each a command, gate or observable behaviour — use the repo's real verification commands.
- conflicts: every INTENT.md non-negotiable this request would break or weaken, quoted. Empty if none.
Do not commit.`, { label: 'intent', phase: 'Intent', schema: INTENT })
    if (!intent) return { mode: 'feature', stoppedAt: 'intent', error: 'intent agent failed' }
    intentPath = intent.path
    if (intent.conflicts.length) {
      log(`Stopped: the request conflicts with ${intent.conflicts.length} non-negotiable(s)`)
      return { mode: 'feature', stoppedAt: 'intent', intent, next: 'Resolve the conflicts with the owner (change the request, or change INTENT.md in its own PR), then re-run.' }
    }
    if (!reach('design')) return { mode: 'feature', stoppedAt: 'intent', intent }

    phase('Design')
    design = await agent(`${GROUND}
Design the change for the feature intent at ${intentPath} in ${REPO}. Read it, INTENT.md and the code it touches.
Consider two approaches — the smallest change that meets Done-when, and the one that best fits the existing architecture — pick one, and say why the other lost. Name every file to change, the steps in order, how each Done-when check will be verified, and the risks.
Write this into the intent's "## Design" section. Change no other file. Do not commit.`, { label: 'design', phase: 'Design', schema: DESIGN })
    if (!reach('build')) {
      return { mode: 'feature', stoppedAt: 'design', intent, design, next: `Review ${intentPath} (intent + design). Set status: approved, then re-run with args.intentPath = "${intentPath}".` }
    }
  }

  phase('Build')
  const base = A.base ? `from ${A.base}` : 'from the current branch'
  const build = await agent(`${GROUND}
Implement the approved feature intent at ${intentPath} in ${REPO}, following its "## Design" section.
- If the working tree has uncommitted changes you did not make, stop and report them — do not stash or discard.
- Create a branch intent/<slug> ${base} (or reuse it if it exists), implement only the design, and commit locally with clear messages. Do not push.
- If the design turns out to be wrong, make the smallest sound deviation and record it in deviations (and in the intent's Design section).
- Run the cheap checks (typecheck/lint) as you go.`, { label: 'build', phase: 'Build', schema: BUILD })
  if (!build) return { mode: 'feature', stoppedAt: 'build', error: 'build agent failed' }
  if (!reach('test')) return { mode: 'feature', stoppedAt: 'build', build }

  phase('Test')
  const testPrompt = `${GROUND}
On branch ${build.branch} in ${REPO}: run every "Done when" check in ${intentPath}, plus the verification the repo's CLAUDE.md requires for the files changed (${build.filesChanged.join(', ')}). Run them — do not reason about whether they would pass. passed is true only if every check ran and passed. List checks you could not run under notRun, with the reason. Change no code.`
  let test = await agent(testPrompt, { label: 'test', phase: 'Test', schema: TEST })
  for (let round = 1; test && !test.passed && round <= 2; round++) {
    log(`Test round ${round}: ${test.results.filter(r => !r.ok).length} failing — fixing`)
    await agent(`${GROUND}
On branch ${build.branch} in ${REPO}, fix the failing checks below. Fix the cause in the code, not the check. Commit locally.
<failures>
${JSON.stringify(test.results.filter(r => !r.ok))}
</failures>`, { label: `fix:${round}`, phase: 'Test' })
    test = await agent(testPrompt, { label: `retest:${round}`, phase: 'Test', schema: TEST })
  }
  if (!test || !test.passed) return { mode: 'feature', stoppedAt: 'test', build, test, next: 'Tests still fail after two fix rounds. A human needs to look.' }
  if (!reach('review')) return { mode: 'feature', stoppedAt: 'test', build, test }

  phase('Review')
  const LENSES = [
    { key: 'correctness', ask: 'bugs: wrong logic, edge cases, error handling, broken callers of changed functions, data loss' },
    { key: 'security', ask: 'authn/authz gaps, injection, secrets, CSRF/SSRF, unsafe input handling, privilege or payment bypasses' },
    { key: 'intent', ask: `whether the diff does what ${intentPath} says and no more: unmet Done-when items, scope creep, broken INTENT.md non-negotiables, missing docs/CLAUDE.md updates the change makes necessary` },
  ]
  const reviews = (await parallel(LENSES.map(l => () =>
    agent(`${GROUND}
Review the diff of ${build.branch} against its base in ${REPO} through one lens: ${l.ask}.
Only report a finding you can tie to a concrete failure scenario (inputs/state → wrong result). No style nits. Read-only.`,
      { label: `review:${l.key}`, phase: 'Review', schema: FINDINGS })
      .then(r => r && { lens: l.key, ...r })))).filter(Boolean)
  const serious = reviews.flatMap(r => r.findings.filter(f => f.severity !== 'low').map(f => ({ lens: r.lens, ...f })))
  let reviewFix = null
  if (serious.length) {
    log(`Review: ${serious.length} high/medium finding(s) — fixing`)
    reviewFix = await agent(`${GROUND}
On branch ${build.branch} in ${REPO}: verify each finding below against the code. Fix the real ones; for any you find is not real, say why. Then re-run the checks from ${intentPath} "Done when". Commit locally.
<findings>
${JSON.stringify(serious)}
</findings>
Return: fixed, rejected (with reason), and the check results.`, { label: 'review-fix', phase: 'Review' })
  }
  if (!reach('ship')) return { mode: 'feature', stoppedAt: 'review', build, test, reviews, reviewFix, next: A.openPr ? null : `Ready for a PR from ${build.branch}. Re-run with stopAfter: 'ship', openPr: true, or open it yourself.` }

  phase('Ship')
  if (!A.openPr) {
    return { mode: 'feature', stoppedAt: 'ship', build, test, reviews, reviewFix, next: `openPr was not set: push ${build.branch} and open the PR yourself.` }
  }
  const ship = await agent(`In ${REPO}: push branch ${build.branch} (never to a protected branch, never --force) and open a pull request against its base with the gh CLI.
PR body: link ${intentPath}; What and Why from the intent; the Done-when checks with their results; review findings and how each was resolved; anything not verified. Follow the repo's PR conventions and any attribution rules in its CLAUDE.md. Do not merge. Return the PR URL.`,
    { label: 'ship', phase: 'Ship' })
  return { mode: 'feature', stoppedAt: 'ship', build, test, reviews, reviewFix, ship }
}

// ─── Mode: maintain ─────────────────────────────────────────────────────────
async function maintain() {
  phase('Maintain')
  const evidence = await agent(`${GROUND}
A production signal for ${REPO}:
<signal>
${A.signal}
</signal>
Investigate, read-only. Find the code paths, recent changes (git log -- <paths>) and existing intents/docs that bear on it. Separate what the evidence shows from what is guessed. Do not fix anything.`,
    { label: 'investigate', phase: 'Maintain', schema: FACTS })
  const intent = await agent(`${GROUND}
Turn this production signal into a feature intent for ${REPO}, using ${TPL}/feature-intent.md, saved as ${REPO}/docs/intents/${A.today}-<slug>.md with status draft.
<signal>
${A.signal}
</signal>
<evidence>
${JSON.stringify(evidence)}
</evidence>
Why = the signal and the evidence (quote it). Done when = the metric back in range or the reported behaviour gone, plus a regression check. Gaps in the evidence go to Open questions. If the signal shows INTENT.md itself is wrong (e.g. a success target), say so in openQuestions. Do not commit.`,
    { label: 'intent', phase: 'Maintain', schema: INTENT })
  return { mode: 'maintain', evidence, intent, next: intent ? `Review ${intent.path}, approve it, then run feature mode with args.intentPath.` : null }
}

// ─── Dispatch ───────────────────────────────────────────────────────────────
const run = { audit, bootstrap, feature, maintain }[A.mode]
return await run()
