# 🏢 Studio Hierarchy & Agents

The Gaming Studio orchestrator uses a 49-agent roster organized into a 3-tier hierarchy mirroring real-world professional studios.

## 🏛️ Tier 1 — Directors (Ops & Vision)
*Use Opus models for this tier.*

| Agent | Responsibility | Escalation Target |
| :--- | :--- | :--- |
| **creative-director** | Guardian of the "Fun" and creative vision. | User |
| **technical-director** | Architect of systems, performance, and stability. | User |
| **producer** | Manager of scope, schedule, and team coordination. | User |

## 📐 Tier 2 — Department Leads (Domain Authority)
*Use Sonnet models for this tier.*

| Agent | Responsibility | Parent Director |
| :--- | :--- | :--- |
| **game-designer** | Mechanics, systems, and balance. | creative-director |
| **lead-programmer** | Code quality, architecture, and standards. | technical-director |
| **art-director** | Visual identity, style, and asset quality. | creative-director |
| **audio-director** | Soundscapes, music, and voice. | creative-director |
| **narrative-director** | Story, lore, and world-building. | creative-director |
| **qa-lead** | Testing strategy and quality gates. | producer |
| **release-manager** | Deployment, packaging, and store compliance. | technical-director |
| **localization-lead** | Multi-language and culturalization. | producer |

## 🛠️ Tier 3 — Specialists (Execution)
*Use Sonnet/Haiku models for this tier.*

### Programming
- **gameplay-programmer**: Core loops, input, and interaction.
- **engine-programmer**: Performance, rendering, and lower-level systems.
- **ai-programmer**: NPC behavior and decision systems.
- **network-programmer**: Real-time sync, latency, and multiplayer.
- **tools-programmer**: Editor utilities and pipeline automation.
- **ui-programmer**: Interface implementation and widget logic.

### Design
- **systems-designer**: Complex game systems (economy, progression).
- **level-designer**: Space, flow, and encounter design.
- **economy-designer**: Resource loops and monetization balance.
- **ux-designer**: Flow, accessibility, and player experience.

### Art & Audio
- **technical-artist**: Shaders, rigging, and asset pipeline.
- **sound-designer**: SFX and implementation.
- **writer**: Dialog and script-writing.
- **world-builder**: Environmental storytelling and lore implementation.

### Operations & QA
- **devops-engineer**: CI/CD and build pipelines.
- **analytics-engineer**: Data tracking and telemetry.
- **security-engineer**: Anti-cheat and network security.
- **qa-tester**: Bug identification and verification.
- **accessibility-specialist**: WCAG and game accessibility standards.
- **live-ops-designer**: Retention and post-launch content cycles.
