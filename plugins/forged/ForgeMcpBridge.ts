import { CrucibleAgentGateway } from './CrucibleAgentGateway.js';

/**
 * ForgeMcpBridge Plugin
 * 
 * Automatically detects newly "Forged" services in the Crucible Gateway 
 * and exposes them as transient MCP tool definitions. This allows external 
 * AI agents to immediately interact with Crucible's autonomous outputs.
 */
export class ForgeMcpBridge {
  private gateway: CrucibleAgentGateway;
  
  constructor(gateway: CrucibleAgentGateway) {
    this.gateway = gateway;
    console.log('CRUCIBLE_BRIDGE_INFO: Forge-to-MCP Bridge activated.');
  }

  /**
   * Generates a collection of MCP Tool definitions based on current gateway routes.
   * This manifest can be consumed by an MCP server to expose Crucible assets.
   */
  public generateMcpManifest(): any[] {
    const routes = this.gateway.getAllRoutes();
    
    return routes.map(route => ({
      name: `call_forged_${this.sanitizeName(route.path)}`,
      description: `Executes a call to the forged asset: ${route.path}. Agent ID: ${route.agentId}`,
      inputSchema: {
        type: 'object',
        properties: {
          payload: { type: 'object', description: 'JSON payload for the asset' },
          metadata: { type: 'object', description: 'Optional tracing metadata' }
        }
      },
      // Crucial for 2026: Metadata about the forging agent is preserved in the bridge
      metadata: {
        agentProvenance: route.agentId,
        cruciblePlatform: '1.0.0-rc.1',
        isForged: true
      }
    }));
  }

  /**
   * Simulates the execution of a bridged MCP tool call.
   * Routes the request back through the Gateway's security and failover logic.
   */
  public async executeBridgedCall(toolName: string, args: any): Promise<any> {
    console.log(`CRUCIBLE_BRIDGE_INFO: Bridged MCP call received for tool: ${toolName}`);
    
    // Extract the internal path from the sanitized tool name
    const path = this.reverseSanitizeName(toolName);
    
    // Pass through Gateway for intelligence failover and routing
    const targetUrl = await this.gateway.handleRequest(path, args.metadata?.headers);
    
    if (targetUrl) {
      return {
        status: 'bridged_success',
        target: targetUrl,
        agentId: 'detected_from_route',
        timestamp: Date.now()
      };
    }

    throw new Error(`CRUCIBLE_BRIDGE_ERROR: Asset for tool ${toolName} not found or inactive.`);
  }

  private sanitizeName(path: string): string {
    return path.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  }

  private reverseSanitizeName(toolName: string): string {
    // This is a simplification for a real system with complex routing
    return toolName.replace('call_forged_', '').replace(/_/g, '/');
  }
}
