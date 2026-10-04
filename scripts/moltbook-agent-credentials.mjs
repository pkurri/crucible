import { readFileSync } from 'fs';

export function apiKeyEnvironmentName(agentName) {
  return `MOLTBOOK_AGENT_${agentName.replace(/[^A-Za-z0-9]/g, '_').toUpperCase()}_API_KEY`;
}

export function resolveAgentApiKey(agent, agentName = agent.agent_name) {
  const environmentName = agent.api_key_env || apiKeyEnvironmentName(agentName);
  const apiKey = process.env[environmentName];

  if (!apiKey) {
    throw new Error(`Missing required environment variable: ${environmentName}`);
  }

  return apiKey;
}

export function loadAgentCredentials(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

export function loadAgentRegistry(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}
