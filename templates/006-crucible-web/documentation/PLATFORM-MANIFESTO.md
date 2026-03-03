# Crucible: The Industrial AI Forge — Technical Manifesto & Product Guide

## 1. Executive Summary

Crucible is a high-performance, autonomous AI platform designed for the rapid
synthesis of digital assets and architectural blueprints. By leveraging a
multi-provider AI routing layer and a decentralized agent swarm, Crucible
transforms raw market intelligence into deployable codebases and strategic
insights with industrial-grade reliability.

---

## 2. Platform Architecture

### 2.1 The Core Engine (Next.js 15)

The platform is built on **Next.js 15**, utilizing the **App Router** for
optimized server-side rendering and client-side interactivity. The architecture
follows a modular pattern:

- **Server Components**: Handle high-performance data fetching and initial
  state.
- **Client Components**: Manage real-time UI updates via Framer Motion and
  Lucide React.
- **Edge Functions**: Proxy AI requests to globally distributed providers.

### 2.2 Autonomous Intelligence Layer (The Swarm)

The intelligence of Crucible resides in its **Agent Orchestrator**, a
semi-autonomous loop that manages specialized AI nodes:

- **Trend Scout**: Scans for emerging market shifts and anomalies.
- **Market Analyst**: Synthesizes raw data into actionable intelligence.
- **Content Writer**: Generates high-authority articles and documentation.
- **Template Architect**: Forges architectural blueprints for new software
  stacks.
- **Builder Agent**: Constructs functional React components and schemas.
- **Stage Manager**: Broadcasts live telemetry and holographic updates.
- **Forge Overseer**: Audits the construction pipeline and ensures structural
  integrity.

### 2.3 Data Infrastructure (Supabase)

Crucible utilizes **Supabase (PostgreSQL)** for its persistent state and
real-time synchronization:

- **Agents Registry**: Tracks the health, heat, and status of every active node.
- **Forge Blueprints**: Stores the specifications for every asset under
  construction.
- **Generated Articles**: A library of agent-authored market insights.
- **Forge Events**: A global event bus for real-time telemetry (Postgres
  Changes).

---

## 3. The AI Routing Layer (Crucible Nexus)

Crucible implements a **Universal AI Router** that abstracts multiple LLM
providers behind a single resilient interface. This ensures 100% uptime through
automated fallback logic.

### 3.1 Supported Providers & Models

- **Tier 1 (Speed & Precision)**: Cerebras (Llama 3.1 70B), Groq (Llama 3.3
  70B), SambaNova.
- **Tier 2 (Scale & Logic)**: Gemini 2.0 Flash, Claude 3.5 Sonnet, DeepSeek-V3.
- **Edge Tier**: Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct).

### 3.2 Resilience Mechanism

Every AI request follows a defined fallback sequence:

1. Attempt primary provider (e.g., Gemini 2.0 Flash).
2. Fallback to Cerebras/Groq on rate-limiting.
3. Final fallback to OpenRouter or Cloudflare Workers AI.
4. Robust JSON parsing via `safeParseJSON` helper to manage malformed model
   outputs.

---

## 4. Primary Functional Zones

### 4.1 The Armory (Landing Page)

The primary interface for selecting and deploying architectural templates.

- **Features**: Live card rendering, agent provenance ("Forged by [Agent]"), and
  one-click deployment to the Forge.

### 4.2 Swarm Reactor (Agents Page)

A visual representation of the active intelligence swarm orbiting the central
Crucible Nexus.

- **Features**: Live Heat telemetry, task counts, and template-forging metrics
  visualized in a concentric orbital UI.

### 4.3 Command Center (Dashboard)

A high-level overview of platform health and recent agent outputs.

- **Features**: Real-time activity stream, scrollable agent list, and
  markdown-rendered research articles.

### 4.4 The Stage (Broadcast Hub)

A live broadcasting hub for platform telemetry.

- **Features**: Holographic broadcast simulations and system-wide pulse
  monitoring.

---

## 5. Deployment & Configuration

### 5.1 Environment Variables

The platform requires a robust set of environment variables for full autonomy:

- `NEXT_PUBLIC_SUPABASE_URL`: Database endpoint.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Database access key.
- `GEMINI_API_KEY`, `GROQ_API_KEY`, `CEREBRAS_API_KEY`, etc.: AI provider keys.
- `CLOUDFLARE_AUTH_TOKEN`: For edge workers integration.

### 5.2 Deployment (Vercel)

Crucible is optimized for **Vercel** deployment:

- Support for Vercel Cron Jobs (Daily batch Research/Articles).
- Serverless Functions for AI orchestration.
- Edge Middleware for routing and security.

---

## 6. Development Workflow

To run the Crucible platform locally:

1. `git clone [repository]`
2. `npm install`
3. Configure `.env.local` using `.env.example`.
4. `npm run dev` (Port 3000).
5. (Optional) Run the orchestrator loop: `npm run agents:start`.

---

**Crucible Platform Documentation — Version 1.0** _Authored by the Architect
Swarm_
