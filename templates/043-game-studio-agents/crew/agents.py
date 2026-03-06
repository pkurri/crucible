"""
===========================================================
NEON ARCADE - CrewAI Agent Definitions
===========================================================

Defines all 7 Neon Arcade agents as crewai.Agent instances.
System prompts are loaded from the existing markdown sub-prompt files.

Free-tier LLMs supported via LiteLLM:
  - Groq:   groq/llama-3.3-70b-versatile  (free API key at console.groq.com)
  - Ollama: ollama/llama3.2               (fully local, zero cost)
===========================================================
"""

from __future__ import annotations

import os
import re
from pathlib import Path

from crewai import Agent, LLM
from crewai_tools import FileReadTool, FileWriterTool
from dotenv import load_dotenv

load_dotenv()

# --- LLM Configuration ---------------------------------------------

def build_llm() -> LLM:
    """
    Build a LiteLLM-backed LLM for CrewAI.
    Configure via .env:
      LLM_PROVIDER=groq       # or: ollama, openai, anthropic
      LLM_MODEL=groq/llama-3.3-70b-versatile
      GROQ_API_KEY=gsk_...    # from console.groq.com (free)
    """
    provider = os.getenv("LLM_PROVIDER", "groq")
    model = os.getenv("LLM_MODEL", "groq/llama-3.3-70b-versatile")

    kwargs: dict = {
        "model": model,
        "temperature": 0.2,
        "max_tokens": 4096,
    }

    if provider == "groq":
        kwargs["api_key"] = os.getenv("GROQ_API_KEY", "")
    elif provider == "ollama":
        kwargs["api_base"] = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    elif provider == "openai":
        kwargs["api_key"] = os.getenv("OPENAI_API_KEY", "")

    return LLM(**kwargs)


# --- Prompt Loader -------------------------------------------------

PROMPTS_DIR = Path(__file__).parent.parent / "src" / "agents" / "prompts"


def load_backstory(prompt_file: str) -> str:
    """
    Extract the System Prompt section from a Neon Arcade .md sub-prompt file.
    Falls back to entire file if section not found.
    """
    filepath = PROMPTS_DIR / prompt_file
    if not filepath.exists():
        return f"You are a specialized AI game development agent ({prompt_file})."

    text = filepath.read_text(encoding="utf-8")

    # Extract "## System Prompt" section
    match = re.search(
        r"## System Prompt\n(.*?)(?=\n## |\Z)",
        text,
        re.DOTALL,
    )
    if match:
        return match.group(1).strip()

    return text.strip()


# --- Shared Tools --------------------------------------------------

_file_reader  = FileReadTool()
_file_writer  = FileWriterTool()

# --- Agent Roster --------------------------------------------------

def create_agents(llm: LLM | None = None) -> dict[str, Agent]:
    """
    Instantiate all 7 Neon Arcade agents.
    Returns a dict keyed by codename.
    """
    _llm = llm or build_llm()

    PULSE = Agent(
        role="Market Analyst",
        goal=(
            "Perform a rigorous Blue Ocean analysis of the game idea. "
            "Identify top competitors, trending mechanics, and the optimal "
            "monetization model (IAP, Ads, Freemium, or Hybrid). "
            "Produce a Go/No-Go verdict backed by market data."
        ),
        backstory=load_backstory("pulse-market-analyst.md"),
        llm=_llm,
        tools=[_file_reader, _file_writer],
        verbose=True,
        allow_delegation=False,
        max_iter=3,
    )

    SCHEMA = Agent(
        role="Requirement Vetter",
        goal=(
            "Convert the game idea and market analysis into a thorough technical PRD. "
            "Select the game engine (Phaser.io / Unity / Godot), list every required 2D asset, "
            "SFX, music track, and third-party SDK. Define version-gated features (MVP -> v1.1 -> v2.0)."
        ),
        backstory=load_backstory("schema-requirement-vetter.md"),
        llm=_llm,
        tools=[_file_reader, _file_writer],
        verbose=True,
        allow_delegation=False,
        max_iter=3,
    )

    DISPATCH = Agent(
        role="Project Manager",
        goal=(
            "Break the PRD into atomic Epics -> Features -> Tasks, each <= 4 hours. "
            "Every task must have a Definition of Done with acceptance criteria, "
            "required tests, and deliverables. Output an execution order by sprint."
        ),
        backstory=load_backstory("dispatch-project-manager.md"),
        llm=_llm,
        tools=[_file_reader, _file_writer],
        verbose=True,
        allow_delegation=False,
        max_iter=3,
    )

    PIXEL = Agent(
        role="Software Engineer",
        goal=(
            "Implement one task at a time from the sprint backlog. "
            "Generate clean, modular, well-commented game code that compiles without errors. "
            "Satisfy every acceptance criterion in the task's Definition of Done. "
            "When given a Fix-it Log from GLITCH, resolve all bugs before resubmitting."
        ),
        backstory=load_backstory("pixel-software-engineer.md"),
        llm=_llm,
        tools=[_file_reader, _file_writer],
        verbose=True,
        allow_delegation=False,
        max_iter=5,
    )

    GLITCH = Agent(
        role="QA & Debugger",
        goal=(
            "Perform static analysis on PIXEL's code. Identify type errors, logic bugs, "
            "security issues, and style violations. Produce a structured Fix-it Log with "
            "severity ratings (CRITICAL / MAJOR / MINOR). Verdict: PASS, FAIL, or ESCALATE."
        ),
        backstory=load_backstory("glitch-qa-debugger.md"),
        llm=_llm,
        tools=[_file_reader, _file_writer],
        verbose=True,
        allow_delegation=False,
        max_iter=3,
    )

    TURBO = Agent(
        role="Performance Optimizer",
        goal=(
            "Analyze the game code for frame-rate issues, memory leaks, oversized assets, "
            "and slow load times. Score each category GREEN/YELLOW/RED against PRD targets. "
            "Output actionable optimization recommendations with before/after code snippets."
        ),
        backstory=load_backstory("turbo-performance-optimizer.md"),
        llm=_llm,
        tools=[_file_reader, _file_writer],
        verbose=True,
        allow_delegation=False,
        max_iter=3,
    )

    GATEWAY = Agent(
        role="Store Policy Expert",
        goal=(
            "Review the game build against current Apple App Store and Google Play guidelines. "
            "Check privacy, age ratings, restricted content, IAP compliance, and accessibility. "
            "Produce a compliance report with verdict: APPROVED, CONDITIONAL, or REJECTED. "
            "Include a ready-to-use submission checklist."
        ),
        backstory=load_backstory("gateway-store-policy-expert.md"),
        llm=_llm,
        tools=[_file_reader, _file_writer],
        verbose=True,
        allow_delegation=False,
        max_iter=3,
    )

    return {
        "PULSE":    PULSE,
        "SCHEMA":   SCHEMA,
        "DISPATCH": DISPATCH,
        "PIXEL":    PIXEL,
        "GLITCH":   GLITCH,
        "TURBO":    TURBO,
        "GATEWAY":  GATEWAY,
    }
