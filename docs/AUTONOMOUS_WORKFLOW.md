# The Crucible Autonomous Forge Workflow

The Crucible platform now operates as a **Self-Reliant, Recursive Development
Ecosystem**. Instead of just displaying mock data, the system actively
researchers the market and writes its own code to improve itself.

Here is the complete end-to-end workflow of how the system expands the _entire
product_ (Skills, Scripts, Plugins, MCPs, and Documentation) 24/7 without human
intervention.

## 1. The Autonomous Worker (`autonomous-forge.ts`)

A Node.js worker runs continuously in the background using the `npm run forge`
command. It orchestrates the entire intelligence and generation loop.

## 2. Global Market Intelligence Gathering (Scraping)

- **Target Selection:** The worker randomly selects a high-value competitor or
  engineering ecosystem (e.g., `voxyz.space`, `vercel.com`, `supabase.com`).
- **Live DOM Extraction:** Using `cheerio`, the worker scrapes the live target
  URL to extract the latest industry trends, product messaging, and technical
  features directly from the competitor's frontend.

## 3. Generative AI Synthesis (Google GenAI / Gemini)

- **Context Injection:** The worker reads Crucible's core identity
  (`docs/WIKI.md`) to understand the boundaries and existing capabilities of
  _your_ project.
- **The LLM Prompt:** The worker sends the scraped competitor data and your
  project's identity to the `gemini-2.5-flash` model.
- **The Objective:** The AI is instructed to act as a "Recursive AI Engineer."
  It must invent a highly useful tool that genuinely improves Crucible based on
  the competitor's data.

## 4. Multi-Domain Recursive Code Generation

The LLM does not just generate JSON data anymore. It outputs **raw, functional
code** across the entire product architecture. The AI decides which area of the
platform needs the improvement the most:

- **1. Agentic Skills:** Generates `.md` instruction schemas in `skills/forged/`
  detailing new LLM protocols.
- **2. Executable Scripts:** Generates `.ts` utilities in `scripts/forged/` that
  automate local workspace tasks.
- **3. Custom Plugins:** Generates `.ts` system extensions in `plugins/forged/`
  to add new pipeline capabilities.
- **4. MCP Tools:** Generates Model Context Protocol tools in `src/mcp/forged/`
  allowing agents to interact with new external APIs.
- **5. Documentation:** Generates `.md` files in `docs/forged/` to structurally
  document new findings, architectural decisions, and platform lore.

## 5. Persistent Memory Storage (Supabase pgvector)

After generating the code, the worker logs the operation into the
`market_research` Postgres database on your Supabase instance:

- It stores the `source_url` it researched.
- It stores the vector `embedding` of the insight, allowing "The Archivist"
  agent to dynamically recall this historical trend later.
- It tags the component for UI routing and categorization.

## 6. Hot-Reloading & Live UI Updates

Because the worker physically writes the `.ts` and `.md` files directly into
your workspace (`fs.writeFileSync`), Next.js detects the file changes and
triggers Hot Module Replacement (HMR).

- If the AI generated a new template or skill definition, it becomes instantly
  available to developers working in the repo.
- The platform practically "grows" new limbs while you sleep, adapting to the
  target markets you define.

---

### How to Monitor the Flow

1. Start your local dev server: `npm run dev`
2. In a separate terminal, ignite the engine: `npm run forge`
3. Watch the console as it outputs `[GATHER]`, `[ANALYZE]`, `[STORE]`, and
   `[WRITE]` events.
4. Check the `skills/forged/`, `scripts/forged/`, `plugins/forged/`,
   `src/mcp/forged/`, and `docs/forged/` directories to see the physical files
   the AI has created.
