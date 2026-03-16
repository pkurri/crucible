# ⚔️ Crucible Sentinel & Auditor: The Steering & Evaluation Layer

> **Moving from "Black Box" Agentic Workflows to Verifiable, Self-Improving Systems.**

Crucible is not just an execution engine; it is a **Verifiable Agent Orchestrator**. Inspired by leading evaluation platforms like *Quotient AI*, we have integrated the **SENTINEL** and **AUDITOR** layers to provide real-time steering and semantic observability for every forge run.

---

## 🛡️ SENTINEL: Real-Time Steering
The **SENTINEL** agent acts as a "Post-Training Layer" that intercepts and validates agent actions *before* they are committed to the real world.

### Key Capabilities
- **Hallucination Gating**: Validates that an agent's proposed action (e.g., a SQL query or a Stripe transaction) is grounded in the user's specific **Directive**.
- **The `gateway_audit` Protocol**: Every tool call in the **Forge Pro** tier is wrapped in an MCP audit. If the Sentinel detects a high-risk or nonsensical parameter, the tool call is blocked, and the agent is forced to "Self-Correct."
- **Low-Latency Scoring**: Sentinel uses specialized, quantized "Judge" models to provide steering decisions in <100ms.

---

## 🔍 AUDITOR: Semantic Evaluation
The **AUDITOR** agent performs deep, asynchronous analysis of completed "chains of thought" to provide reliability scores and ROI data.

### Semantic Tracing (OpenInference)
Crucible now exports enriched telemetry following the **OpenInference** standard. Instead of simple logs, we capture **Spans**:
- **Root Span**: The high-level user request (e.g., "Build a Match-3 Game").
- **Agent Spans**: The individual reasoning phases (Vanguard, Pixel, etc.).
- **Tool Spans**: Precise metadata on API interactions.

### Automated Detections
After a pipeline completes, the Auditor scans the traces for:
- **Logic Leaks**: Points where the agent logic deviated from the architecture.
- **Efficiency Index**: Identification of redundant steps or unnecessary token usage.
- **ROI Calculation**: The Auditor maps agent actions to human engineering hours, providing a dollar-value "Saved" metric for every run.

---

## 💰 Forge Pro & Enterprise Monetization

The Sentinel and Auditor features are primary pillars of the **Crucible Pro** experience:

| Feature | Standard (Free) | Forge Pro |
| :--- | :--- | :--- |
| **Observability** | Basic Logs | Full Semantic Traces |
| **Safety** | User-defined only | **SENTINEL** Steering Gate |
| **Insights** | Final Result only | **AUDITOR** Reliability Report |
| **Monetization** | N/A | Included in $19/mo tier |

---

## 🛠️ Usage Example

```typescript
// Example of a SENTINEL-gated tool call in Crucible
const result = await crucible.execute({
  agent: 'PIXEL',
  tool: 'supabase_delete_table',
  params: { table: 'production_users' },
  options: {
    steering: 'STRICT', // Sentinel will block if not explicitly in the Directive
    audit: true
  }
});

// LOG: 🛡️ [SENTINEL] Tool-call Gated: 'delete_table' attempt rejected.
// REASON: Destructive action detected with no 'safety_override' token.
```

---

## 🚀 The Vision: Self-Improving Forge
By combining the **Sentinel's** real-time feedback with the **Auditor's** deep evaluation, Crucible creates a "Flywheel Effect." Failures are automatically converted into **Evaluation Datasets**, which are then used to fine-tune the **Directives** for future forge runs.

*Crucible Sentinel: Forge with Confidence. Forge with Data.*
