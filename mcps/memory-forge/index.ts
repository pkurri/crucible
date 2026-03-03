import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Memory-Forge MCP Server
 * 
 * Provides "Cognitive Checkpoints" for AI agents, allowing them to 
 * store and retrieve session states across fragmented workflows.
 */
class MemoryForgeServer {
  private server: Server;
  
  // In a real implementation, this would connect to a Vector DB like Supabase pgvector
  private memoryStore: Array<{
    id: string;
    content: string;
    agentId: string;
    timestamp: number;
    metadata: any;
  }> = [];

  constructor() {
    this.server = new Server(
      {
        name: 'memory-forge',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'save_checkpoint',
        description: 'Saves a cognitive checkpoint (session state) for future recall.',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: { type: 'string', description: 'ID of the agent saving the state' },
            checkpointContent: { type: 'string', description: 'The actual logic/decisions to preserve' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Keywords for retrieval' }
          },
          required: ['agentId', 'checkpointContent']
        }
      },
      {
        name: 'retrieve_context',
        description: 'Performs a semantic search for past cognitive checkpoints.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'The topic or problem context to search for' },
            limit: { type: 'number', default: 3 }
          },
          required: ['query']
        }
      }
    ];
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools()
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'save_checkpoint':
            return await this.handleSaveCheckpoint(args);
          case 'retrieve_context':
            return await this.handleRetrieveContext(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    });
  }

  private async handleSaveCheckpoint(args: any) {
    const { agentId, checkpointContent, tags = [] } = args;
    const id = Math.random().toString(36).substring(7);
    
    const checkpoint = {
      id,
      agentId,
      content: checkpointContent,
      timestamp: Date.now(),
      metadata: { tags }
    };
    
    this.memoryStore.push(checkpoint);
    console.error(`[MEMORY-FORGE] Saved checkpoint ${id} for agent ${agentId}`);

    return {
      content: [{ type: 'text', text: `Checkpoint ${id} forged successfully.` }]
    };
  }

  private async handleRetrieveContext(args: any) {
    const { query, limit = 3 } = args;
    
    // Simulating semantic search - in production this uses pgvector match_documents
    const results = this.memoryStore
      .filter(m => m.content.toLowerCase().includes(query.toLowerCase()) || 
                  m.metadata.tags.some((t: string) => t.toLowerCase() === query.toLowerCase()))
      .slice(0, limit);

    return {
      content: [{
        type: 'text',
        text: results.length > 0 
          ? JSON.stringify(results, null, 2) 
          : "No relevant cognitive checkpoints found in the Forge."
      }]
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Memory-Forge MCP server running on stdio');
  }
}

const server = new MemoryForgeServer();
server.run().catch(console.error);
