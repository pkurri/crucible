---
name: workflow-aws-well-architected-audit
description:
  'End-to-end read-only audit of an AWS account or an entire AWS Organization
  against the 6 core AWS Well-Architected Framework pillars, the Agentic AI Lens
  (applied only where Bedrock Agents/AgentCore/agentic workloads are detected),
  AWS Control Tower landing-zone/guardrail health, and AWS Health organizational
  event monitoring. Discovers member accounts, collects evidence per pillar,
  scores findings, and produces a per-account + org-wide report. Triggers:
  well-architected review, WAFR, cloud health check, agentic AI lens audit,
  control tower health, landing zone drift, AWS organization audit.'
triggers:
  - 'When asked to audit/review/score an AWS account or organization against
    Well-Architected'
  - 'When asked to assess agentic AI / Bedrock Agent workloads architecturally'
  - 'When this workflow is referenced by another skill or agent'
---

# AWS Well-Architected + Agentic AI Lens Audit

Read-only, multi-account audit built on the
[aws-well-architected-audit](../../skills/aws-well-architected-audit/SKILL.md)
skill and the
[aws-well-architected-auditor](../../agents/aws-well-architected-auditor.md)
agent. Uses the AWS MCP server's sandboxed `call_boto3` for every API call —
nothing here writes to AWS.

## Phase 1: Preflight & Discovery

1. Confirm AWS credentials resolve (`sts:GetCallerIdentity`) and note the
   identity/partition/account.
2. Attempt `organizations:DescribeOrganization` + paginated
   `organizations:ListAccounts`. On `AWSOrganizationsNotInUseException` or
   `AccessDenied`, fall back to single-account scope — state this explicitly in
   the eventual report rather than silently narrowing scope.
3. For each active member account, attempt to assume the audit role
   (`OrganizationAccountAccessRole` or a purpose-built read-only audit role).
   Accounts that fail assumption go on an **unreachable** list with the exact
   error — never dropped silently.
4. From the management account (once, not per member account): check whether
   Control Tower is deployed (`controltower:ListLandingZones`) and whether AWS
   Health organizational view is enabled
   (`organizations:ListAWSServiceAccessForOrganization`/
   `health:DescribeHealthServiceStatusForOrganization`). Report "not
   detected"/"not enabled" explicitly rather than skipping silently.

## Phase 2: Evidence Collection (per reachable account)

Run the pillar check catalog from the skill against each account — this
naturally parallelizes per account since each account's evidence is independent:

- Operational Excellence, Security, Reliability, Performance Efficiency, Cost
  Optimization, Sustainability — see the skill's pillar → API table for the
  exact read-only calls per pillar. Check AWS support tier before relying on
  Trusted Advisor checks; degrade gracefully otherwise.

## Phase 3: Agentic Workload Discovery & Lens Assessment

1. Per account, check for Bedrock Agents/Knowledge Bases/Guardrails, AgentCore,
   and heuristic Step Functions/Lambda agent-orchestration signals.
2. Where nothing is found: record "Agentic AI Lens not applicable" for that
   account and move on — don't force findings.
3. Where agentic workloads exist: run the Agentic AI Lens's six adapted pillars
   (Operational Excellence, Security, Reliability, Performance Efficiency, Cost
   Optimization, Sustainability) per the skill's table.

## Phase 3b: Control Tower & AWS Health Assessment (org-level, once)

1. **Control Tower** — landing zone version/drift, per-OU enabled-control
   status/drift, baseline currency, unmanaged accounts. Skip with an explicit
   "not detected" note if Control Tower isn't deployed.
2. **AWS Health** — open operational issues and unactioned scheduled changes
   org-wide (or single-account if organizational view isn't enabled); check
   support tier before relying on per-event detail APIs, degrading to aggregate
   counts on Basic/Developer support.
3. Tag every finding from this phase `[Control Tower]` or `[AWS Health]` and
   fold it into the Operational Excellence/Security/Reliability pillar scores
   rather than inventing a seventh pillar.

## Phase 4: Scoring & Findings

Score every pillar 1–5 per account, independently (no averaging across
accounts). Every score below 4 must carry: the evidence, the specific
best-practice violated (cited from the actual AWS pillar/lens doc, not from
memory), and a concrete remediation step.

## Phase 5: Report Synthesis

1. Per-account scorecards (core pillars + Agentic AI Lens where applicable).
2. Org-wide risk heatmap (accounts × pillars) — the primary deliverable when
   auditing more than one account.
3. Org-level governance section: Control Tower + AWS Health findings, each
   explicitly marked not-applicable/not-enabled when absent.
4. Unreachable-accounts list with reasons.
5. Default output: a Markdown report. If the user wants a visual dashboard,
   publish an Artifact heatmap — load `dataviz` then `artifact-design` first,
   and treat it as a confirm-before-execute step only in the sense that
   publishing is one-way to a shareable link, not because it's destructive.

## Guardrails

- Every call in this workflow is `List*`/`Describe*`/`Get*`. If a finding
  suggests a fix, that fix is a separate, explicitly-authorized follow-up — this
  workflow never remediates.
- Don't invent WAFR check IDs, API parameters, or lens best-practice text from
  memory — verify against AWS docs (`search_documentation`/
  `read_documentation`) when a specific citation matters for the report.
- This is a large fan-out task (N accounts × ~6-12 pillars each) — if the
  session has explicit multi-agent orchestration opted in (e.g. "ultracode"),
  consider the `Workflow` tool to parallelize per-account evidence collection
  via `pipeline()`; otherwise run it inline account-by-account through the
  `aws-well-architected-auditor` agent.

## Companion Resources

- Skill:
  [aws-well-architected-audit](../../skills/aws-well-architected-audit/SKILL.md)
- Agent:
  [aws-well-architected-auditor](../../agents/aws-well-architected-auditor.md)
- AWS docs:
  [Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html),
  [Agentic AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentic-ai-lens.html),
  [Control Tower Controls Reference](https://docs.aws.amazon.com/controltower/latest/controlreference/control-metadata-tables.html),
  [AWS Health Organizational View](https://docs.aws.amazon.com/health/latest/ug/aggregate-events.html)
