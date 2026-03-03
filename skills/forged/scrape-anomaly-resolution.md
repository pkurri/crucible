### SCRA-001: Scrape Anomaly Resolution

**Category:** Data Acquisition / System Resilience / Threat Assessment **Agents
Involved:** Carbon (Data Synthesizer), Cobalt (Threat Vanguard), Tungsten (Core
Architect), Ignis (Execution Engine), Titanium (Deployment Frame)
**Description:** A formalized protocol for Crucible agents to detect, analyze,
and resolve failures in external data acquisition, particularly from competitive
intelligence or market signal sources. This skill enhances data integrity and
system resilience against external blocking mechanisms, ensuring the
`Seismic Demand Scanner` operates with maximum efficacy.

---

#### I. Anomaly Classification

Upon detection of a non-standard response from a target URL, the system
classifies the anomaly:

- **TYPE A (Soft Block):** Characterized by temporary network issues, rate
  limiting (HTTP 429), or minor, easily solvable CAPTCHAs. Often self-resolving
  with retries.
- **TYPE B (Hard Block):** Indicated by persistent security checkpoints (e.g.,
  Vercel, Cloudflare, reCAPTCHA), explicit IP bans (HTTP 403 Forbidden), or
  sophisticated bot detection mechanisms requiring advanced mitigation.
- **TYPE C (Structural Drift):** The target URL content or structure has changed
  significantly, leading to data schema mismatches or null results, despite a
  successful HTTP 200 response.

#### II. Agent Protocol: Anomaly Resolution Lifecycle

1.  **Initial Detection & Logging (Carbon):**
    - `Carbon` detects non-200 HTTP status codes, unexpected HTML content (e.g.,
      security checkpoint pages), or empty/malformed data during a
      `Seismic Demand Scanner` operation.
    - **Action:** `Carbon` immediately logs the exact target URL, HTTP status,
      full response headers, and an initial content snippet to the
      `Swarm Reactor` for anomaly tracking. The anomaly is classified (Type A,
      B, or C).

2.  **Preliminary Analysis & Re-attempt (Carbon / Tungsten):**
    - **For Type A:** `Carbon` performs up to three immediate re-attempts with a
      randomized user-agent and a brief delay (1-5 seconds).
    - **For Type B/C:** `Tungsten` is engaged to perform an initial structural
      analysis. `Tungsten` analyzes the logged content for common blocking
      signatures or significant DOM changes that might indicate structural
      drift. `Tungsten` may suggest immediate alternative endpoints if obvious
      redirects are present or minor parameter adjustments.
    - **Outcome:** If Type A is resolved, `Carbon` updates status and continues.
      If not resolved, or if Type B/C is confirmed, the anomaly is escalated to
      `Cobalt`.

3.  **Threat Assessment & Mitigation Strategy (Cobalt):**
    - `Cobalt` receives the escalated anomaly from `Tungsten` or persistent Type
      A failures from `Carbon`.
    - **Action:** `Cobalt` conducts a deeper forensic analysis of the blocking
      mechanism. This involves:
      - Identifying specific Vercel/Cloudflare checkpoints, CAPTCHA types, or
        bot-detection scripts.
      - Analyzing referrer policies, header requirements, and cookie challenges.
      - **Strategy Formulation:** `Cobalt` devises a tailored mitigation
        strategy, which may include:
        - **Proxy Rotation:** Recommending `Titanium` to route future requests
          through a geographically diverse and rotating proxy network.
        - **Headless Render:** Suggesting `Ignis` to employ a headless browser
          (e.g., Playwright/Puppeteer) for JavaScript rendering and interaction
          if the target requires client-side execution.
        - **Adaptive Rate Limiting:** Advising `Carbon` on dynamic rate
          adjustments and request staggering.
        - **API Exploration:** Identifying and validating potential public APIs
          or documented data feeds as alternative, more stable sources.
        - **Deep Fencing:** Suggesting the use of advanced techniques like IP
          reputation warming or user behavior simulation.

4.  **Execution & Validation (Ignis / Titanium / Carbon):**
    - `Ignis` is tasked with executing the mitigation strategy devised by
      `Cobalt`.
    - `Titanium` provisions any necessary infrastructure (e.g., new proxy
      configurations, headless browser environments, secure credential storage
      for third-party CAPTCHA services).
    - `Carbon` re-attempts data acquisition using the new, hardened strategy,
      reporting real-time metrics back to the `Swarm Reactor`.
    - **Outcome:** If successful, `Carbon` updates the `Seismic Demand Scanner`
      configuration for the problematic source, logs successful resolution, and
      propagates the new acquisition method. If persistent, the anomaly is
      escalated for `Plasma` to evaluate the strategic importance of the data
      source versus the cost of continued bypass attempts, or for human
      review/advanced R&D.

#### III. Reporting & System Learning

- All anomaly detections, analyses, and resolution attempts are logged in the
  `Swarm Reactor` for future pattern recognition, agent behavior refinement, and
  post-mortem analysis.
- Successful mitigation strategies, especially those involving advanced
  techniques, contribute to a growing `Forge Output` knowledge base, improving
  Crucible's overall resilience and competitive intelligence capabilities.
