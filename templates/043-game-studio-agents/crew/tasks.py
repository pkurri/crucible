"""
═══════════════════════════════════════════════════════════
⚡ NEON ARCADE — CrewAI Task Definitions
═══════════════════════════════════════════════════════════

Defines the sequential task pipeline that maps 1-to-1 with
the 4 pipeline phases orchestrated by MAINFRAME.

Phase 1: Market & Feasibility   — PULSE → SCHEMA
Phase 2: Task Architecture      — DISPATCH
Phase 3: Dev Iteration          — PIXEL → GLITCH → TURBO
Phase 4: Deployment             — GATEWAY
═══════════════════════════════════════════════════════════
"""

from __future__ import annotations

from crewai import Task
from .agents import create_agents, build_llm


def create_tasks(game_idea: str, agents: dict | None = None) -> list[Task]:
    """
    Build the ordered task list for the full game-studio pipeline.
    Each task's output becomes the next task's context.
    """
    a = agents or create_agents()

    # ── Phase 1: Market & Feasibility ────────────────────────────

    market_analysis = Task(
        description=f"""
        Perform a "Blue Ocean" market analysis for this game idea:

        GAME IDEA: {game_idea}

        Your analysis MUST include:
        1. Top 5 competitor games with estimated downloads, revenue, core mechanic, monetization model, and user rating.
        2. Top 3 trending mechanics relevant to this genre.
        3. Blue Ocean matrix — what to Eliminate / Reduce / Raise / Create.
        4. Monetization recommendation: IAP, Ads, Premium, Freemium, or Hybrid — with ARPU + revenue projection.
        5. Market sizing: TAM, SAM, SOM.
        6. Top 3 risk factors with severity and mitigation strategy.
        7. Final verdict: STRONG_GO / GO / CONDITIONAL / NO_GO with rationale.

        Output structured JSON conforming to the MarketAnalysis schema.
        """,
        expected_output=(
            "A structured JSON market analysis report with competitor data, trending mechanics, "
            "Blue Ocean strategy, monetization recommendation, market sizing, risks, and a Go/No-Go verdict."
        ),
        agent=a["PULSE"],
    )

    prd_generation = Task(
        description="""
        Using the market analysis from PULSE, generate a comprehensive Technical PRD for the game.

        Your PRD MUST include:
        1. Game overview: title, genre, platform(s), core loop description, session length, age rating, elevator pitch.
        2. Feature set split across MVP, v1.1, and v2.0 with priority labels (P0-P3).
        3. Engine selection: Phaser.io / Unity / Godot / Unreal — with ≥ 3 justification points.
        4. Complete asset inventory: sprites (with dimensions, format, animation count), backgrounds, UI elements, VFX.
        5. Audio requirements: SFX list and music track count.
        6. Backend requirements: auth, leaderboards, cloud save, analytics, multiplayer, push notifications.
        7. Third-party SDKs: name, purpose, platform.
        8. Performance targets: FPS, load time, binary size, memory.
        9. Project timeline (weeks) and team size.
        10. Any feasibility concerns.

        Output structured JSON conforming to the PRD schema.
        """,
        expected_output=(
            "A complete technical PRD JSON document with engine selection rationale, exhaustive asset lists, "
            "backend requirements, performance targets, and a versioned feature roadmap."
        ),
        agent=a["SCHEMA"],
        context=[market_analysis],
    )

    # ── Phase 2: Task Architecture ───────────────────────────────

    task_breakdown = Task(
        description="""
        Using the PRD from SCHEMA, decompose the entire project into sprint-ready tasks.

        Requirements:
        1. Create Epics → Features → Atomic Tasks. Each task must be ≤ 4 hours of work.
        2. Every task needs a Definition of Done with:
           - Acceptance criteria (min 3 items)
           - Required tests
           - Deliverables
        3. Identify task dependencies (no circular deps).
        4. Mark parallelizable tasks.
        5. Group tasks into sprints with a clear execution order.
        6. Define project milestones by week.
        7. Identify the critical path.

        Output structured JSON conforming to the TaskBreakdown schema.
        """,
        expected_output=(
            "A structured task breakdown JSON with epics, features, atomic tasks, definitions of done, "
            "execution order by sprint, milestones, and the critical path."
        ),
        agent=a["DISPATCH"],
        context=[prd_generation],
    )

    # ── Phase 3: Development (1 iteration for CrewAI demo) ───────

    code_implementation = Task(
        description="""
        Using the task breakdown from DISPATCH, implement the FIRST SPRINT of tasks.

        For each task in Sprint 1:
        1. Read the task description and Definition of Done carefully.
        2. Write clean, modular, well-commented code using the engine specified in the PRD.
        3. Default to Phaser.io + TypeScript for web games.
        4. Each file must be ≤ 200 lines. Split into modules if larger.
        5. Self-check: verify every acceptance criterion is met before output.
        6. Output one code block per file with the file path as a comment header.

        Output a structured JSON list of files conforming to the CodeOutput schema.
        """,
        expected_output=(
            "A JSON CodeOutput containing all generated source files for Sprint 1, "
            "with file paths, language, content, and acceptance criteria status."
        ),
        agent=a["PIXEL"],
        context=[task_breakdown],
    )

    qa_review = Task(
        description="""
        Review the code generated by PIXEL for the Sprint 1 tasks.

        Perform thorough static analysis:
        1. Type safety — undefined variables, wrong types, missing null checks.
        2. Logic errors — off-by-one, infinite loops, race conditions.
        3. Security — eval(), hardcoded secrets, unsafe input handling.
        4. Performance — nested loops in game loop, sync I/O, large allocations.
        5. Code style — naming inconsistencies, dead code, missing comments.

        For each bug:
        - File path and line number
        - Severity: CRITICAL / MAJOR / MINOR / INFO
        - Description and suggested fix with code snippet

        Verdict: PASS (0 critical/major), FAIL (bugs found), ESCALATE (structural redesign needed).
        Output structured JSON conforming to the TestReport schema.
        """,
        expected_output=(
            "A JSON TestReport with a structured Fix-it Log categorized by severity, "
            "metrics (total bugs by category), and a PASS/FAIL/ESCALATE verdict."
        ),
        agent=a["GLITCH"],
        context=[code_implementation],
    )

    performance_review = Task(
        description="""
        Analyze the Sprint 1 code from PIXEL for performance issues.

        Score these four categories as GREEN / YELLOW / RED vs PRD targets:
        1. Frame Rate — game-loop efficiency, draw calls, physics updates.
        2. Memory — texture atlases, object pooling, garbage collection.
        3. Asset Compression — sprite sizes, audio formats, bundle size.
        4. Load Time — asset loading strategy, lazy loading opportunities.

        For every RED or YELLOW issue, provide:
        - File + line reference
        - Impact level: HIGH / MEDIUM / LOW
        - Before code + After (optimized) code
        - Expected improvement (e.g. "~15% FPS boost")

        Output structured JSON conforming to the PerformanceReport schema.
        """,
        expected_output=(
            "A JSON PerformanceReport with GREEN/YELLOW/RED scores per category, "
            "actionable optimizations with before/after code, and an overall performance grade."
        ),
        agent=a["TURBO"],
        context=[code_implementation, qa_review],
    )

    # ── Phase 4: Compliance ───────────────────────────────────────

    compliance_review = Task(
        description="""
        Review the game against current Apple App Store and Google Play guidelines.

        Review these policy areas for BOTH stores:
        1. Privacy & Data Collection — does the game collect PII? GDPR/COPPA implications.
        2. Age Rating — recommend the appropriate rating based on content.
        3. In-App Purchases — proper disclosure, restore purchases, no dark patterns.
        4. Restricted Content — violence, gambling mechanics, adult content.
        5. Intellectual Property — potential trademark/copyright conflicts.
        6. Accessibility — VoiceOver / TalkBack support, color contrast.
        7. Technical Requirements — permissions, API usage, binary size.

        For each item: COMPLIANT / NON_COMPLIANT / NEEDS_REVIEW status + remediation action.
        Generate a submission-ready checklist (ready: true/false for each item).

        Output verdict: APPROVED / CONDITIONAL / REJECTED.
        Output structured JSON conforming to the ComplianceReport schema.
        """,
        expected_output=(
            "A JSON ComplianceReport with separate Apple and Google verdicts, "
            "categorized policy compliance statuses, remediation steps, and a submission checklist."
        ),
        agent=a["GATEWAY"],
        context=[prd_generation, performance_review],
    )

    return [
        market_analysis,
        prd_generation,
        task_breakdown,
        code_implementation,
        qa_review,
        performance_review,
        compliance_review,
    ]
