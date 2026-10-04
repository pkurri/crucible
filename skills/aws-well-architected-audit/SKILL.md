---
name: aws-well-architected-audit
description:
  'Read-only AWS Organizations-wide audit against the AWS Well-Architected
  Framework (6 core pillars), the AWS Well-Architected Agentic AI Lens (for
  accounts running Bedrock Agents/AgentCore or other agent frameworks), AWS
  Control Tower landing-zone/guardrail health, and AWS Health organizational
  event monitoring. Discovers every member account, maps each pillar to concrete
  read-only boto3/AWS MCP calls, scores findings, and produces a per-account +
  org-wide report. Triggers: well-architected review, WAFR, cloud audit, agentic
  AI lens, control tower health, landing zone drift, AWS organization health
  check.'
allowed-tools:
  - Read
  - Bash
triggers:
  - 'When asked to audit, review, or score an AWS account/organization against
    Well-Architected'
  - 'When asked to assess agentic AI / Bedrock Agent workloads for architectural
    best practices'
  - 'When this skill is referenced by another agent or workflow'
---

# AWS Well-Architected + Agentic AI Lens Audit

Read-only assessment of one or more AWS accounts (optionally an entire AWS
Organization) against:

1. The 6 core **Well-Architected Framework** pillars.
2. The **Agentic AI Lens**
   (`docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/`), applied only
   to accounts where agentic workloads (Bedrock Agents, AgentCore,
   agent-orchestrating Step Functions/Lambdas) are actually detected.
3. **AWS Control Tower** landing-zone version/drift and guardrail (enabled
   control) compliance, when the organization is managed by Control Tower.
4. **AWS Health** organizational event posture — open issues, unresolved
   scheduled changes, and accounts affected — when organizational health view is
   enabled.

Nothing here writes or modifies AWS resources. Every API call listed below is a
`List*`/`Describe*`/`Get*` read. Use the AWS MCP server's `call_boto3`
(preferred — sandboxed, audited) or the AWS CLI as fallback per this session's
AWS guidance.

## Permission model

| Tier                        | Purpose                                                                                            | Scope                                                                                                                                                                                                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Org discovery**           | Enumerate member accounts                                                                          | `organizations:DescribeOrganization`, `organizations:ListAccounts`, `organizations:ListDelegatedAdministrators` — callable only from the management account or a delegated admin                                                                                                                 |
| **Per-account read**        | Run pillar checks in each member account                                                           | An audit role must already exist in each account, trusted by the caller (e.g. `OrganizationAccountAccessRole` for the management account, or a purpose-built `WellArchitectedAuditRole` with `ReadOnlyAccess`/`SecurityAudit` managed policies) — this skill does not create trust relationships |
| **Single-account fallback** | `organizations:DescribeOrganization` returns `AWSOrganizationsNotInUseException` or `AccessDenied` | Run all per-account checks against the caller's own account only, and say so explicitly in the report — never silently narrow scope without flagging it                                                                                                                                          |

If a member account's audit role can't be assumed, report that account as
**unreachable** with the specific error — do not skip it silently.

## Discovery (run once)

1. `sts:GetCallerIdentity` — confirm identity/account/partition.
2. `organizations:DescribeOrganization` + paginated `organizations:ListAccounts`
   — full account roster (id, name, email, status). Only `ACTIVE` accounts are
   in scope; note `SUSPENDED`/pending accounts but don't audit them.
3. For each active account, attempt `sts:AssumeRole` into the audit role.
   Accounts that fail assumption go into the "unreachable" list, not silently
   dropped.
4. Per reachable account, run **Agentic Workload Discovery** (below) to decide
   whether the Agentic AI Lens applies.
5. From the management account, check whether the org is Control-Tower-managed
   and whether AWS Health organizational view is enabled (see the two sections
   below) — both are org-level, run once, not per member account.

## Control Tower landing zone & guardrail health

Run once, from the management (or delegated admin) account. If
`controltower:ListLandingZones` returns empty or errors with `AccessDenied`,
report **"Control Tower not detected — section not applicable"** rather than
treating it as a failure; not every organization uses Control Tower.

| Check                          | Signal                                                                                                                                                         | Primary APIs                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Landing zone version/drift     | Landing zone deployed but not on the latest available version; drift detected                                                                                  | `controltower:ListLandingZones`, `controltower:GetLandingZone`                                       |
| Guardrail (control) compliance | Enabled controls whose `statusSummary.status` isn't `SUCCEEDED`, or whose `driftStatusSummary.driftStatus` is `DRIFTED` (vs. `IN_SYNC`/`NOT_CHECKING`), per OU | `controltower:ListEnabledControls --target-identifier <ou-arn>`, `controltower:GetEnabledControl`    |
| Baseline currency              | Accounts/OUs enrolled on a baseline version behind the latest available                                                                                        | `controltower:ListBaselines`, `controltower:ListEnabledBaselines`, `controltower:GetEnabledBaseline` |
| OU structure sanity            | Accounts sitting outside any Control-Tower-governed OU (unmanaged)                                                                                             | `organizations:ListOrganizationalUnitsForParent`, `organizations:ListAccountsForParent`              |

Findings here feed the **Operational Excellence** and **Security** pillar scores
(guardrails are largely preventive/detective security controls) — don't
double-count them as a separate pillar; fold them in with a `[Control Tower]`
tag on the finding so it's traceable to source.

## AWS Health organizational monitoring

Run once, from the management account. Organizational health view requires
`health:EnableHealthServiceAccessForOrganization` to have been called previously
— check via
`organizations:ListAWSServiceAccessForOrganization`/`health:DescribeHealthServiceStatusForOrganization`
first. If it's not enabled, report **"AWS Health organizational view not enabled
— section limited to the caller's own account"** and fall back to
`health:DescribeEvents` for the single account rather than silently skipping the
pillar.

Full event _detail_ (`DescribeEventDetailsForOrganization`,
`DescribeAffectedEntitiesForOrganization`) requires Business/Enterprise support
— confirm support tier first (as in the Cost Optimization pillar) and degrade to
aggregate counts only (`DescribeEventAggregates`) on Basic/Developer support
rather than failing the section.

| Check                        | Signal                                                                                                                         | Primary APIs                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Open operational issues      | Unresolved `issue`-category events across the org, by service/account, especially high-severity/abuse events                   | `health:DescribeEventsForOrganization` (filter `eventStatusCodes=open`), `health:DescribeEventAggregates` |
| Unactioned scheduled changes | `scheduledChange` events (e.g. EC2/RDS maintenance, deprecations) with a start time approaching and no evidence of remediation | `health:DescribeEventsForOrganization` (filter `eventTypeCategory=scheduledChange`)                       |
| Blast radius per event       | Which accounts/entities are affected, to prioritize by business impact                                                         | `health:DescribeAffectedAccountsForOrganization`, `health:DescribeAffectedEntitiesForOrganization`        |

Findings here feed the **Reliability** and **Operational Excellence** pillar
scores, tagged `[AWS Health]` — an org sitting on unresolved high-severity
Health events is an operational-excellence and reliability gap regardless of how
clean its infrastructure config otherwise looks.

## Core Well-Architected pillar checks

Each row is a signal, not the full lens — cite AWS's own pillar whitepapers
(`docs.aws.amazon.com/wellarchitected/latest/<pillar>-pillar/`) via
`search_documentation`/`read_documentation` for the authoritative best-practice
text before writing remediation guidance; don't invent WAFR check IDs from
memory.

| Pillar                 | Read-only signals                                                                                                                                                                                                                                                       | Primary APIs                                                                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | Multi-region CloudTrail enabled + log file validation; AWS Config recorder + recorder status per region; tagging coverage; CloudWatch alarm coverage on critical resources                                                                                              | `cloudtrail:DescribeTrails/GetTrailStatus`, `config:DescribeConfigurationRecorders/DescribeConfigurationRecorderStatus`, `resourcegroupstaggingapi:GetResources`, `cloudwatch:DescribeAlarms`                                               |
| Security               | IAM Access Analyzer findings; root account MFA + IAM credential report (unused creds >90d, no rotation); GuardDuty enabled per region; Security Hub enabled + standards subscriptions; S3 account-level Block Public Access; KMS key rotation status                    | `accessanalyzer:ListFindings`, `iam:GetCredentialReport/GetAccountSummary`, `guardduty:ListDetectors/GetDetector`, `securityhub:DescribeHub/GetEnabledStandards`, `s3control:GetPublicAccessBlock`, `kms:GetKeyRotationStatus`              |
| Reliability            | Multi-AZ on RDS/ElastiCache; Auto Scaling group min/max/health-check config; Route 53 health checks; AWS Backup plan coverage; CloudFormation stack drift                                                                                                               | `rds:DescribeDBInstances`, `autoscaling:DescribeAutoScalingGroups`, `route53:ListHealthChecks`, `backup:ListBackupPlans/ListProtectedResources`, `cloudformation:DetectStackDrift`                                                          |
| Performance Efficiency | Compute Optimizer recommendations (EC2/Lambda/EBS); Graviton/arm64 adoption rate; Lambda memory/timeout tuning signals                                                                                                                                                  | `compute-optimizer:GetEC2InstanceRecommendations/GetLambdaFunctionRecommendations`, `ec2:DescribeInstances` (architecture), `lambda:ListFunctions` (Architectures field)                                                                    |
| Cost Optimization      | Cost Explorer spend trend + service breakdown; Savings Plans/RI coverage & utilization; idle resources (unattached EBS, unassociated EIPs, idle load balancers) via Trusted Advisor where support tier allows, else Compute Optimizer + CloudWatch idle-metric fallback | `ce:GetCostAndUsage`, `ce:GetSavingsPlansCoverage/GetReservationUtilization`, `support:DescribeTrustedAdvisorCheckResult` (Business/Enterprise only — check support tier first via `support:DescribeSeverityLevels` and degrade gracefully) |
| Sustainability         | AWS Customer Carbon Footprint Tool data (if opted in); Graviton adoption %; count of long-idle/zero-utilization resources flagged for decommission                                                                                                                      | Customer Carbon Footprint Tool console API is not currently a public boto3 API — note this as a manual-review item rather than fabricating a call; use Graviton adoption from the Performance Efficiency data as a proxy signal             |

## Agentic workload discovery (run before applying the Agentic AI Lens)

Only apply the lens to accounts where at least one of these is non-empty:

- `bedrock-agent:ListAgents`, `ListKnowledgeBases`, `ListGuardrails`
- `bedrock-agentcore` control-plane list APIs (if the service is enabled in the
  account/region — treat `AccessDenied`/`UnrecognizedClientException` as "not in
  use here", not as an error)
- Step Functions state machines or Lambda functions whose tags/names indicate
  agent orchestration (heuristic only — flag as "possible agentic workload,
  needs human confirmation" rather than asserting it as fact)

If nothing is found, report **"No agentic workloads detected in this account —
Agentic AI Lens not applicable"** and move on. Don't force lens findings onto a
plain infrastructure account.

## Agentic AI Lens pillar checks (only for accounts with detected workloads)

Six pillars adapted for agentic systems per
`docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/`:

| Pillar                 | What to look for                                                                                                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | Prompt/agent version lifecycle management; behavioral monitoring (CloudWatch/X-Ray traces on agent invocations); human-in-the-loop approval gates on high-impact actions                                                      |
| Security               | Least-privilege IAM roles scoped per agent/tool (not one broad role shared across agents); Bedrock Guardrails configured (content filters, denied topics); protections against prompt injection and tool-privilege escalation |
| Reliability            | Retry/backoff and fallback behavior on model throttling or tool failure; circuit breakers preventing runaway agent loops; graceful degradation to partial functionality                                                       |
| Performance Efficiency | Model tier right-sizing per task complexity; caching of repeated prompts/retrievals; multi-agent coordination overhead (unnecessary hop count between agents)                                                                 |
| Cost Optimization      | Token usage monitoring/alerting; model selection tied to task cost sensitivity; guardrail-based cost caps (max tokens, max tool calls)                                                                                        |
| Sustainability         | Reuse of shared agent/tool components vs. duplicated bespoke agents; avoidance of redundant model calls (e.g. re-summarizing already-summarized context)                                                                      |

Cite the actual lens doc for best-practice wording rather than paraphrasing from
memory when the check surfaces a finding worth explaining in the report.

## Scoring

Score each pillar per account 1–5 (1 = critical gaps, 5 = strong adherence),
independently — don't average across accounts to hide a bad outlier. For each
score below 4, include: the specific evidence (API + finding), the AWS
best-practice it violates (with doc link), and a concrete remediation step.

## Report output

- **Per-account scorecard**: pillar × score table + top findings + remediation,
  plus a separate Agentic AI Lens scorecard only for accounts where it applied.
- **Org-level governance section**: Control Tower landing zone/guardrail
  findings (tagged `[Control Tower]`) and AWS Health findings (tagged
  `[AWS Health]`), each reported once for the org rather than duplicated per
  account, and each explicitly marked "not applicable"/"not enabled" when absent
  rather than omitted.
- **Org-wide rollup**: a risk heatmap (accounts × pillars) surfacing the weakest
  pillars/accounts across the org — this is the highest-value view for an org
  with many accounts, don't bury it under per-account detail.
- **Unreachable accounts**: listed explicitly with the assumption error, never
  silently omitted from the account count.
- Default to a Markdown report file; if the user wants a visual heatmap, publish
  it as an Artifact (load the `dataviz` skill first for the heatmap/scorecard
  visualization, and `artifact-design` before writing any HTML).
