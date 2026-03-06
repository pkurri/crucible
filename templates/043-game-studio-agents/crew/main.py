"""
===========================================================
NEON ARCADE - MAINFRAME (CrewAI Entry Point)
===========================================================

Run the full 4-phase AI Game Studio pipeline using CrewAI
with free-tier LLMs (Groq or Ollama).

SETUP (pick one):
  Option A - Groq (free cloud API, no GPU required):
    1. Get a free key at https://console.groq.com
    2. Set GROQ_API_KEY=gsk... in your .env
    3. LLM_PROVIDER=groq  LLM_MODEL=groq/llama-3.3-70b-versatile

  Option B - Ollama (fully local, zero cost):
    1. Install Ollama: https://ollama.com
    2. ollama pull llama3.2
    3. LLM_PROVIDER=ollama  LLM_MODEL=ollama/llama3.2

USAGE:
  python -m crew.main "A match-3 puzzle game with roguelike elements"
  python -m crew.main  # uses default demo idea
===========================================================
"""

from __future__ import annotations

import json
import sys
import time
from datetime import datetime
from pathlib import Path

from crewai import Crew, Process
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import print as rprint

from .agents import create_agents, build_llm
from .tasks import create_tasks

load_dotenv()
console = Console()

# --- Default demo game idea -----------------------------------------

DEFAULT_IDEA = (
    "A casual hypercasual game where players control a glowing orb "
    "that absorbs smaller particles to grow while avoiding larger enemies. "
    "Web-based with daily challenges, a global leaderboard, and a color-theme shop."
)

# --- Output directory -----------------------------------------------

WORKSPACE = Path(__file__).parent.parent / "workspace"


def save_output(name: str, data: str) -> Path:
    """Save crew output to the shared workspace."""
    out_dir = WORKSPACE / "crew-outputs"
    out_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    filepath = out_dir / f"{timestamp}-{name}.md"
    filepath.write_text(data, encoding="utf-8")
    return filepath


# --- Banner ---------------------------------------------------------

def print_banner(game_idea: str) -> None:
    console.print(Panel.fit(
        "N E O N   A R C A D E\n"
        "[dim]AI Game Studio - CrewAI Pipeline[/dim]\n\n"
        "[bold]Agents:[/bold] PULSE -> SCHEMA -> DISPATCH -> PIXEL -> GLITCH -> TURBO -> GATEWAY\n"
        "[bold]Idea:[/bold]   " + game_idea[:80] + ("..." if len(game_idea) > 80 else ""),
        title="[bold white]MAINFRAME[/bold white]",
        border_style="cyan",
    ))


# --- Roster Table ---------------------------------------------------

def print_roster() -> None:
    table = Table(title="Neon Arcade - Agent Roster", border_style="cyan")
    table.add_column("Codename", style="bold cyan")
    table.add_column("Role")
    table.add_column("Phase")

    roster = [
        ("PULSE",    "Market Analyst",         "Market & Feasibility"),
        ("SCHEMA",   "Requirement Vetter",      "Market & Feasibility"),
        ("DISPATCH", "Project Manager",         "Task Architecture"),
        ("PIXEL",    "Software Engineer",       "Dev Iteration"),
        ("GLITCH",   "QA & Debugger",           "Dev Iteration"),
        ("TURBO",    "Performance Optimizer",   "Dev Iteration"),
        ("GATEWAY",  "Store Policy Expert",     "Deployment"),
    ]

    for codename, role, phase in roster:
        table.add_row(codename, role, phase)

    console.print(table)


# --- CrewAI Pipeline ------------------------------------------------

def run(game_idea: str) -> None:
    print_banner(game_idea)
    print_roster()

    console.print("\n[bold yellow]Initializing crew...[/bold yellow]")
    
    # Ensure workspace directories exist
    (WORKSPACE / "crew-outputs").mkdir(parents=True, exist_ok=True)
    
    start = time.time()

    # Build LLM and agents
    llm    = build_llm()
    agents = create_agents(llm)
    tasks  = create_tasks(game_idea, agents)

    # Assemble the crew (sequential process mirrors MAINFRAME pipeline)
    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process.sequential,   # Phase 1 -> 2 -> 3 -> 4, in order
        verbose=True,
        memory=False,                  # agents remember earlier outputs (OpenAI required for True)
        # embedder={
        #     "provider": "ollama" if "ollama" in (
        #         __import__("os").getenv("LLM_PROVIDER", "groq")
        #     ) else "openai",
        #     "config": {"model": "mxbai-embed-large"},
        # },
        output_log_file=str(WORKSPACE / "crew-outputs" / "crew-run.log"),
    )

    console.print("[bold green]Crew assembled - starting pipeline![/bold green]\n")

    # == Kickoff ==================================================
    result = crew.kickoff(inputs={"game_idea": game_idea})
    # =============================================================

    elapsed = time.time() - start

    # Save and display results
    output_path = save_output("pipeline-result", str(result))

    console.print(Panel.fit(
        f"[bold green]Pipeline complete![/bold green]\n\n"
        f"Elapsed:   {elapsed:.1f}s\n"
        f"Output:    {output_path}\n"
        f"Workspace: {WORKSPACE}",
        title="[bold white]MAINFRAME - Summary[/bold white]",
        border_style="bright_blue",
    ))

    # Print final result snippet
    result_str = str(result)
    console.print("\n[bold]Final Output (first 1000 chars):[/bold]")
    console.print(result_str[:1000] + ("..." if len(result_str) > 1000 else ""))


# --- CLI Entry Point ------------------------------------------------

if __name__ == "__main__":
    idea = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else DEFAULT_IDEA
    run(idea)
