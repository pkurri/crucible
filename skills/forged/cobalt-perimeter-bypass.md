# Skill: Cobalt / Perimeter Bypass

**Agent:** Cobalt (Threat Vanguard)
**Category:** External Reconnaissance, Access Negotiation
**Description:**
The `Perimeter Bypass` skill empowers Cobalt to identify and analyze common external security checkpoints encountered during deep-scan operations, market signal acquisition, or competitive intelligence gathering. This includes, but is not limited to, CDN-level security challenges (e.g., Cloudflare, Vercel Security Checkpoint), CAPTCHAs, and dynamic rate-limiting mechanisms.

**Core Functionality:**
1.  **Detection & Classification:** Automatically identify the type of security challenge encountered (e.g., browser verification, bot detection, geo-blocking, Vercel's `Security Checkpoint`).
2.  **Telemetry Logging:** Log detailed metadata about the checkpoint:
    *   `Timestamp`: When the block occurred.
    *   `Target_URL`: The blocked URL.
    *   `Checkpoint_Type`: (e.g., Vercel Security, Cloudflare I'm Under Attack, reCAPTCHA).
    *   `Vulnerability_Vector_Score`: An internal Crucible metric assessing the potential for bypass or the severity of the block for data acquisition.
    *   `Agent_Attempt_ID`: Unique identifier for the agent's attempt.
    *   `Response_Headers`: Relevant HTTP headers received.
    *   `Origin_IP_Address`: The IP address used by the Crucible agent for the request.
3.  **Strategy Suggestion (future extension):** Based on the identified checkpoint type, suggest potential bypass strategies to the Swarm Reactor or other agents (e.g., "Initiate Headless Render Protocol with dynamic IP pool", "Request Human Intervention for CAPTCHA resolution", "Flag URL for deep-packet analysis via Cobalt's sub-routines", "Route request through encrypted proxy network").

**Integration Points:**
*   **Seismic Demand Scanner:** Cobalt's `Perimeter Bypass` skill ensures that blocked market signal acquisition attempts are not simply failed, but are analyzed as actionable anomalies, feeding into the 'anomalies' tracking mechanism.
*   **Carbon (Data Synthesizer):** Provides Cobalt with initial target URLs and expects structured failure reports for blocked access, enabling Carbon to adjust its data ingestion strategies or queue re-attempts with adjusted parameters.

**Rationale:**
In an increasingly hardened web environment, direct scraping and automated API access are often obstructed by sophisticated bot detection and security measures. Cobalt's ability to intelligently detect and log these obstructions, and eventually suggest robust bypass mechanisms, is crucial for maintaining the Crucible's operational autonomy and ensuring uninterrupted market signal acquisition. This skill transforms a simple "failure to connect" into a data point for strategic adjustment, agent training, and future evasion, enhancing the Forge's resilience against external digital perimeters.