/**
 * Crucible Sovereign: Local LLM & Infrastructure Configuration Template
 * 
 * Use this template to configure your air-gapped environment.
 * Copy this to src/config/sovereign-config.ts and update the values.
 */

export const SovereignConfig = {
  // 1. Intelligence Layer (Ollama / vLLM / Local VLM)
  intelligence: {
    provider: 'openai-compatible', // Local engines usually follow OpenAI spec
    baseUrl: process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1',
    apiKey: process.env.LOCAL_LLM_KEY || 'sovereign-internal-use-only',
    defaultModel: 'llama-3-70b-instruct',
    embeddingModel: 'nomic-embed-text',
    timeoutMs: 30000,
  },

  // 2. Data Sovereignty (Isolated DB & Cache)
  storage: {
    useLocalVault: true,
    pgConfig: {
      host: process.env.INTERNAL_PG_HOST || 'internal-vault-db',
      port: 5432,
      ssl: false, // Internal traffic usually doesn't require cloud-style SSL handshakes
    },
    redisConfig: {
      host: process.env.INTERNAL_REDIS_HOST || 'internal-vault-cache',
      port: 6379,
    },
  },

  // 3. Security & Governance (Regulator Settings)
  governance: {
    telemetryEnabled: false, // Absolute killswitch for external pings
    piiScrubber: {
      mode: 'BLOCK', // In Sovereign mode, we BLOCK instead of just redacting
      strictLevel: 'ITAR-Compliant',
    },
    circuitBreaker: {
      maxMonthlyTokens: 500_000_000, // Massive capacity for internal clusters
      tripLevelResetHours: 24,
    },
  },

  // 4. Identity & Access (Air-Gapped Auth)
  auth: {
    provider: 'local-active-directory',
    bypassExternalOAuth: true,
  }
};

export type TSovereignConfig = typeof SovereignConfig;
