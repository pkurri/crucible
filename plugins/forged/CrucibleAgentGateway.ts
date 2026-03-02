/**
 * @file CrucibleAgentGateway.ts
 * @description A plugin providing a unified, secure gateway for accessing services and data models "Forged" by Crucible agents.
 *              Inspired by Vercel's "AI Gateway: One endpoint, all your models." This enhances Crucible's
 *              ability to expose its sophisticated AI outputs as consumable services.
 */

// --- Placeholder Type Definitions (In a real system, these would be in shared core libraries) ---
// Assuming types like AgentServiceRegistration are defined globally or imported from a core module.

/**
 * Represents a service an agent registers with the gateway.
 */
interface AgentServiceRegistration {
  agentId: string;
  name: string; // Unique name of the service (e.g., 'market-prediction-model')
  version: string; // Version of the service (e.g., '1.0.0')
  endpoint: string; // The internal URL where the agent's service is running (e.g., 'http://localhost:port/api/predict')
  metadata?: Record<string, any>; // Additional descriptive data
  securityConfig?: {
    authentication?: boolean; // Does this service require authentication?
    authorizationRoles?: string[]; // Specific roles allowed to access this service
  };
}

/**
 * Represents a single route configured in the gateway.
 */
interface GatewayRoute {
  path: string; // The external, public-facing path (e.g., '/forge-api/market-prediction/v1')
  targetUrl: string; // The internal URL where the request will be proxied
  agentId: string; // ID of the agent that registered this service
  metadata: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  security: {
    authentication: boolean;
    authorizationRoles?: string[];
  };
}

/**
 * Global configuration for the Crucible Agent Gateway.
 */
interface GatewayConfiguration {
  basePath: string; // The root path for all gateway-exposed services (e.g., '/forge-api')
  authenticationRequired: boolean; // Global setting: does the gateway require auth by default?
  rateLimitingEnabled: boolean; // Global setting: enable rate limiting for all routes by default?
  // Add more global gateway settings like CORS policies, logging levels, etc.
}
// --- End Placeholder Type Definitions ---


/**
 * The CrucibleAgentGateway class manages the registration and routing of agent-generated services.
 * It provides a secure and scalable entry point for external systems to consume Crucible's "Forged" outputs,
 * such as specialized AI models, data APIs, or microservices.
 */
export class CrucibleAgentGateway {
  private routes: Map<string, GatewayRoute> = new Map();
  private config: GatewayConfiguration;

  constructor(initialConfig: Partial<GatewayConfiguration> = {}) {
    this.config = {
      basePath: initialConfig.basePath || '/forge-api',
      authenticationRequired: initialConfig.authenticationRequired !== undefined ? initialConfig.authenticationRequired : true,
      rateLimitingEnabled: initialConfig.rateLimitingEnabled !== undefined ? initialConfig.rateLimitingEnabled : true,
      ...initialConfig,
    };
    console.log(`Crucible Agent Gateway initialized with base path: ${this.config.basePath}`);
  }

  /**
   * Registers a service provided by a Crucible agent with the gateway.
   * This allows the service to be exposed via a unified, external gateway endpoint.
   * For instance, Carbon's data syntheses or Plasma's predictive models could be exposed.
   * @param agentService The service registration object from an agent.
   * @returns boolean - true if registration was successful, false otherwise.
   */
  public registerAgentService(agentService: AgentServiceRegistration): boolean {
    if (!agentService.name || !agentService.endpoint || !agentService.version) {
      console.error('CRUCIBLE_GATEWAY_ERROR: Invalid agent service registration:', agentService);
      return false;
    }

    const routeKey = `${agentService.name}-${agentService.version}`; // Unique identifier for the route
    if (this.routes.has(routeKey)) {
      console.warn(`CRUCIBLE_GATEWAY_WARN: Service '${routeKey}' already registered. Overwriting existing route.`);
    }

    const gatewayRoute: GatewayRoute = {
      path: `${this.config.basePath}/${agentService.name}/${agentService.version}`,
      targetUrl: agentService.endpoint,
      agentId: agentService.agentId,
      metadata: agentService.metadata || {},
      status: 'active',
      security: agentService.securityConfig || { authentication: this.config.authenticationRequired },
    };

    this.routes.set(routeKey, gatewayRoute);
    console.log(`CRUCIBLE_GATEWAY_INFO: Registered agent service: '${agentService.name}' (v${agentService.version}) at public path: '${gatewayRoute.path}'`);
    return true;
  }

  /**
   * Deregisters a service from the gateway, making it no longer publicly accessible through this endpoint.
   * @param serviceName The name of the service to deregister.
   * @param serviceVersion The version of the service.
   * @returns boolean - true if deregistration was successful, false otherwise.
   */
  public deregisterAgentService(serviceName: string, serviceVersion: string): boolean {
    const routeKey = `${serviceName}-${serviceVersion}`;
    if (this.routes.delete(routeKey)) {
      console.log(`CRUCIBLE_GATEWAY_INFO: Deregistered agent service: '${serviceName}' (v${serviceVersion})`);
      return true;
    }
    console.warn(`CRUCIBLE_GATEWAY_WARN: Service '${routeKey}' not found for deregistration.`);
    return false;
  }

  /**
   * Retrieves all currently registered gateway routes.
   * This can be used by the Swarm Reactor for oversight or by Cobalt for security audits.
   * @returns An array of GatewayRoute objects.
   */
  public getAllRoutes(): GatewayRoute[] {
    return Array.from(this.routes.values());
  }

  /**
   * Simulates handling an incoming request to the gateway.
   * In a live Crucible deployment, this would be an actual HTTP request handler, performing
   * authentication, authorization, rate limiting, and then proxying the request to the target agent service.
   * @param requestPath The path of the incoming request (e.g., '/forge-api/market-prediction/v1/query').
   * @param headers Optional request headers for security or routing logic.
   * @returns A promise resolving to the target internal URL (with remaining path) or null if no route is found.
   */
  public async handleRequest(requestPath: string, headers?: Record<string, string>): Promise<string | null> {
    // A real gateway would need more sophisticated routing, e.g., using a trie or regex matching.
    // This basic implementation iterates through routes.
    for (const route of this.routes.values()) {
      if (requestPath.startsWith(route.path)) {
        // In a production environment, implement actual security checks here:
        // 1. Authentication (e.g., JWT validation using `headers`)
        // 2. Authorization (check `headers` against `route.security.authorizationRoles`)
        // 3. Rate Limiting (based on source IP, API key, etc.)

        console.log(`CRUCIBLE_GATEWAY_INFO: Request for '${requestPath}' matched route '${route.path}'. Preparing to target: '${route.targetUrl}'`);
        
        // Append the remaining part of the request path to the target URL
        const proxyTarget = route.targetUrl + requestPath.substring(route.path.length);
        return proxyTarget;
      }
    }
    console.warn(`CRUCIBLE_GATEWAY_WARN: No route found for incoming request path: '${requestPath}'`);
    return null;
  }

  /**
   * Updates the gateway's global configuration.
   * This could be managed by Tungsten for architectural consistency or Ignis for operational adjustments.
   * @param newConfig Partial new configuration to apply.
   */
  public updateConfiguration(newConfig: Partial<GatewayConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('CRUCIBLE_GATEWAY_INFO: Gateway configuration updated:', this.config);
  }

  /**
   * Provides a health check for the gateway.
   * @returns An object indicating the gateway's operational status.
   */
  public getStatus(): { status: 'operational' | 'degraded' | 'offline'; activeRoutes: number; totalRoutes: number } {
    const activeRoutes = Array.from(this.routes.values()).filter(r => r.status === 'active').length;
    return {
      status: activeRoutes > 0 ? 'operational' : 'degraded',
      activeRoutes,
      totalRoutes: this.routes.size,
    };
  }
}
