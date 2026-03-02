/**
 * @file ModelConduit: The AI Gateway for Crucible Agents
 * @description This MCP Tool provides a unified, secure, and efficient interface
 *              for all Crucible agents to access diverse external AI models.
 *              Inspired by Vercel's AI Gateway, it centralizes model access,
 *              API key management, rate limiting, and intelligent routing.
 * 
 *              This component integrates directly into the 'Swarm Reactor'
 *              to enhance the cognitive capabilities of all agent personas
 *              (Tungsten, Cobalt, Plasma, Carbon, Titanium, Ignis) by providing
 *              a standardized and managed access layer to external intelligence.
 */

// Placeholder types - these would typically be defined in a shared types file (e.g., src/types/crucible.ts)
export interface AgentPersona {
  id: string;
  name: string;
  persona: string; // e.g., 'Core Architect', 'Threat Vanguard'
}

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelRequest {
  messages: ModelMessage[];
  // Allow for provider-specific parameters to be passed through
  openaiSpecificParams?: Record<string, any>;
  anthropicSpecificParams?: Record<string, any>;
  [key: string]: any; // Catch-all for other parameters
}

export interface ModelResponse {
  content: string;
  // Other response data, e.g., usage, finish_reason, model_id
  [key: string]: any;
}

export interface RateLimitConfig {
  requestsPerMinute?: number;
  tokensPerMinute?: number;
}

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | string; // 'string' for extensibility
  modelName: string;
  endpoint: string;
  rateLimit?: RateLimitConfig;
  // Other provider-specific configurations
}

// Mock logger for demonstration within this file. In a real Crucible setup,
// this would use the platform's standardized logging utility.
const logger = {
  info: (...args: any[]) => console.log(`[ModelConduit::INFO] ${new Date().toISOString()}`, ...args),
  error: (...args: any[]) => console.error(`[ModelConduit::ERROR] ${new Date().toISOString()}`, ...args),
  debug: (...args: any[]) => console.debug(`[ModelConduit::DEBUG] ${new Date().toISOString()}`, ...args),
};

/**
 * ModelConduit Class: Implements the AI Gateway functionality.
 * Ensures secure, controlled, and abstracted access to external AI models
 * for all Crucible agents.
 */
export class ModelConduit {
  private static instance: ModelConduit;
  private modelConfigurations: Map<string, AIServiceConfig>;
  private apiKeys: Map<string, string>;
  private requestQueue: Array<() => Promise<ModelResponse>>; // Queue for managing sequential requests
  private currentConcurrentRequests: number = 0; // Tracks active requests
  private maxConcurrentRequests: number = 5; // Configurable max concurrent calls to external APIs
  private queueProcessingInterval: NodeJS.Timeout; // Timer for processing the queue

  private constructor() {
    this.modelConfigurations = new Map();
    this.apiKeys = new Map();
    this.requestQueue = [];
    this.initializeConfigurations();
    // Start a periodic check to process the request queue
    this.queueProcessingInterval = setInterval(() => this.processQueue(), 250); // Process every 250ms
  }

  /**
   * Get the singleton instance of ModelConduit.
   * @returns ModelConduit instance.
   */
  public static getInstance(): ModelConduit {
    if (!ModelConduit.instance) {
      ModelConduit.instance = new ModelConduit();
    }
    return ModelConduit.instance;
  }

  /**
   * Initializes AI service configurations and securely loads API keys.
   * In a production Crucible environment, API keys would be sourced from
   * a secure secret management system (e.g., Supabase Vault or external KMS).
   */
  private initializeConfigurations() {
    // Define commonly used models and their endpoints/rate limits
    this.modelConfigurations.set('openai-gpt4o', {
      provider: 'openai',
      modelName: 'gpt-4o',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      rateLimit: { requestsPerMinute: 60, tokensPerMinute: 150000 } // Example limits
    });
    this.modelConfigurations.set('anthropic-claude3', {
      provider: 'anthropic',
      modelName: 'claude-3-opus-20240229',
      endpoint: 'https://api.anthropic.com/v1/messages',
      rateLimit: { requestsPerMinute: 30, tokensPerMinute: 100000 } // Example limits
    });
    // Add more configurations for other models/providers as needed

    // Load API keys from environment variables. Crucial for security.
    this.apiKeys.set('openai', process.env.CRUCIBLE_OPENAI_API_KEY || 'sk-mock-openai-key-SET-ENV-VAR');
    this.apiKeys.set('anthropic', process.env.CRUCIBLE_ANTHROPIC_API_KEY || 'sk-mock-anthropic-key-SET-ENV-VAR');

    logger.info('ModelConduit initialized with AI service configurations. Please ensure CRUCIBLE_<PROVIDER>_API_KEY environment variables are securely set.');
  }

  /**
   * Queues an AI model request for dispatch, managing concurrency and rate limits.
   * Agents should call this method to interact with external AI models.
   * @param agent The Crucible Agent Persona initiating the request.
   * @param request The generic model request payload.
   * @param modelId The identifier for the desired AI model (e.g., 'openai-gpt4o').
   * @returns A promise that resolves with the AI model's response.
   */
  public async dispatchRequest(
    agent: AgentPersona,
    request: ModelRequest,
    modelId: string
  ): Promise<ModelResponse> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const config = this.modelConfigurations.get(modelId);
          if (!config) {
            throw new Error(`ModelConduit: Unknown model ID '${modelId}' requested by ${agent.name}.`);
          }

          const apiKey = this.apiKeys.get(config.provider);
          if (!apiKey || apiKey.includes('mock-')) {
            throw new Error(`ModelConduit: API key for provider '${config.provider}' is missing or is a mock key. Set CRUCIBLE_${config.provider.toUpperCase()}_API_KEY.`);
          }

          const response = await this.executeModelCall(agent, config, apiKey, request);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
      // The interval will pick up this request eventually
    });
  }

  /**
   * Processes items in the request queue, respecting concurrency limits.
   */
  private processQueue() {
    if (this.requestQueue.length > 0 && this.currentConcurrentRequests < this.maxConcurrentRequests) {
      const nextTask = this.requestQueue.shift();
      if (nextTask) {
        this.currentConcurrentRequests++;
        // Execute the task without awaiting, so the loop can continue processing other tasks
        nextTask().finally(() => {
          this.currentConcurrentRequests--;
        });
      }
    }
  }

  /**
   * Executes the actual HTTP call to the external AI model API.
   * Handles provider-specific headers and body formatting.
   * @param agent The agent making the request.
   * @param config The configuration for the target AI service.
   * @param apiKey The API key for authentication with the AI provider.
   * @param request The original model request payload.
   * @returns The transformed AI model response.
   * @throws Error if the API call fails or the provider is unsupported.
   */
  private async executeModelCall(
    agent: AgentPersona,
    config: AIServiceConfig,
    apiKey: string,
    request: ModelRequest
  ): Promise<ModelResponse> {
    logger.debug(`ModelConduit: Executing request for ${config.modelName} (provider: ${config.provider}) from ${agent.name}.`);

    try {
      let response: Response;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      let body: any;

      // Provider-specific logic for headers and body structure
      if (config.provider === 'openai') {
        headers['Authorization'] = `Bearer ${apiKey}`;
        body = {
          model: config.modelName,
          messages: request.messages,
          ...request.openaiSpecificParams, // Merge OpenAI-specific params
        };
      } else if (config.provider === 'anthropic') {
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01'; // Required API version for Anthropic
        body = {
          model: config.modelName,
          messages: request.messages,
          ...request.anthropicSpecificParams, // Merge Anthropic-specific params
        };
      } else {
        throw new Error(`Unsupported AI provider: ${config.provider}`);
      }

      // Perform the fetch request to the AI model endpoint
      response = await fetch(config.endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error(`ModelConduit: AI call failed for ${config.modelName}. Status: ${response.status}, Error: ${JSON.stringify(errorData)}`);
        throw new Error(`AI Service error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      logger.debug(`ModelConduit: Successfully received response for ${config.modelName}.`);

      // Transform the raw provider response into Crucible's generic ModelResponse format
      return this.transformResponse(config.provider, data);

    } catch (error) {
      logger.error(`ModelConduit: Error during AI model call for ${config.modelName}:`, error);
      throw error; // Re-throw for upstream error handling
    }
  }

  /**
   * Transforms a raw response from an AI provider into a standardized ModelResponse.
   * @param provider The name of the AI provider.
   * @param rawResponse The raw JSON response from the AI API.
   * @returns A standardized ModelResponse object.
   */
  private transformResponse(provider: string, rawResponse: any): ModelResponse {
    if (provider === 'openai' && rawResponse.choices && rawResponse.choices.length > 0) {
      return {
        content: rawResponse.choices[0].message.content,
        model_id: rawResponse.model,
        usage: rawResponse.usage, // Include token usage for cost tracking
      };
    } else if (provider === 'anthropic' && rawResponse.content && rawResponse.content.length > 0) {
        // Anthropic messages API typically returns an array of content blocks.
        const textContent = rawResponse.content.find((block: any) => block.type === 'text');
        return {
            content: textContent ? textContent.text : '',
            model_id: rawResponse.model,
            usage: rawResponse.usage,
        };
    }
    // Fallback for unexpected or new provider responses
    logger.warn(`ModelConduit: Received unexpected response format for provider ${provider}:`, rawResponse);
    return { content: JSON.stringify(rawResponse), model_id: 'unknown', usage: {} };
  }

  /**
   * Cleans up any resources when the ModelConduit is no longer needed.
   */
  public shutdown() {
    clearInterval(this.queueProcessingInterval);
    logger.info('ModelConduit shut down. Queue processing stopped.');
  }
}

// Example usage (for internal Crucible testing/demonstration, not part of core MCP logic)
/*
async function testModelConduit() {
  const conduit = ModelConduit.getInstance();
  const carbon: AgentPersona = { id: 'carbon-007', name: 'Carbon', persona: 'Data Synthesizer' };

  const prompt: ModelRequest = {
    messages: [{ role: 'user', content: 'Generate a JSON schema for tracking supply chain provenance of raw materials, including fields for origin, batch number, and certifications.' }],
    // Example of passing provider-specific parameters
    openaiSpecificParams: { temperature: 0.7, max_tokens: 500 },
  };

  try {
    logger.info('Initiating test request to OpenAI GPT-4o via ModelConduit...');
    const openaiResponse = await conduit.dispatchRequest(carbon, prompt, 'openai-gpt4o');
    logger.info('OpenAI Response received (truncated to 200 chars):\n' + openaiResponse.content.substring(0, 200) + '...');

    logger.info('Initiating test request to Anthropic Claude 3 via ModelConduit...');
    const anthropicResponse = await conduit.dispatchRequest(carbon, prompt, 'anthropic-claude3');
    logger.info('Anthropic Response received (truncated to 200 chars):\n' + anthropicResponse.content.substring(0, 200) + '...');

  } catch (error) {
    logger.error('ModelConduit Test Failed:', error);
  } finally {
    conduit.shutdown(); // Clean up the interval timer
  }
}

// Uncomment to run a quick test during development:
// testModelConduit();
*/