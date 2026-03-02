import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Example MCP Server for Crucible
 * 
 * This server provides tools for:
 * - Database operations (query, insert, update)
 * - File system operations (read, write, list)
 * - System information (env, platform, version)
 */
class ExampleMCPServer {
  private server: Server;
  private dbConnection: any; // Would be actual DB connection

  constructor() {
    this.server = new Server(
      {
        name: 'example-mcp-server',
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

  /**
   * Define available tools
   */
  private getTools(): Tool[] {
    return [
      {
        name: 'database_query',
        description: 'Execute a SQL query on the database',
        inputSchema: {
          type: 'object',
          properties: {
            sql: {
              type: 'string',
              description: 'SQL query to execute',
            },
            params: {
              type: 'array',
              description: 'Query parameters',
              items: { type: 'string' },
            },
          },
          required: ['sql'],
        },
      },
      {
        name: 'file_read',
        description: 'Read contents of a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File path to read',
            },
            encoding: {
              type: 'string',
              description: 'File encoding (default: utf8)',
              enum: ['utf8', 'base64', 'binary'],
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'file_write',
        description: 'Write content to a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File path to write',
            },
            content: {
              type: 'string',
              description: 'Content to write',
            },
            encoding: {
              type: 'string',
              description: 'File encoding (default: utf8)',
              enum: ['utf8', 'base64'],
            },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'file_list',
        description: 'List files in a directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Directory path to list',
            },
            recursive: {
              type: 'boolean',
              description: 'List recursively',
              default: false,
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'system_info',
        description: 'Get system information',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Type of information to retrieve',
              enum: ['platform', 'env', 'version', 'all'],
              default: 'all',
            },
          },
        },
      },
      {
        name: 'env_get',
        description: 'Get environment variable value',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Environment variable name',
            },
          },
          required: ['name'],
        },
      },
    ];
  }

  /**
   * Setup request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: this.getTools() };
    });

    // Execute tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'database_query':
            return await this.handleDatabaseQuery(args);
          case 'file_read':
            return await this.handleFileRead(args);
          case 'file_write':
            return await this.handleFileWrite(args);
          case 'file_list':
            return await this.handleFileList(args);
          case 'system_info':
            return await this.handleSystemInfo(args);
          case 'env_get':
            return await this.handleEnvGet(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Handle database query tool
   */
  private async handleDatabaseQuery(args: any) {
    const { sql, params = [] } = args;

    // Validate SQL (basic check - production would need more robust validation)
    if (!this.isValidSql(sql)) {
      throw new Error('Invalid SQL query');
    }

    // Mock database execution
    // In production, this would execute against actual database
    const mockResult = {
      rows: [
        { id: 1, name: 'Example 1' },
        { id: 2, name: 'Example 2' },
      ],
      rowCount: 2,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockResult, null, 2),
        },
      ],
    };
  }

  /**
   * Handle file read tool
   */
  private async handleFileRead(args: any) {
    const { path: filePath, encoding = 'utf8' } = args;

    try {
      // In production, implement actual file reading with proper security
      const mockContent = `// Mock content for ${filePath}\n// File encoding: ${encoding}`;

      return {
        content: [
          {
            type: 'text',
            text: mockContent,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  /**
   * Handle file write tool
   */
  private async handleFileWrite(args: any) {
    const { path: filePath, content, encoding = 'utf8' } = args;

    try {
      // In production, implement actual file writing with proper security
      console.error(`Writing to ${filePath} (${encoding})`);

      return {
        content: [
          {
            type: 'text',
            text: `Successfully wrote to ${filePath}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  /**
   * Handle file list tool
   */
  private async handleFileList(args: any) {
    const { path: dirPath, recursive = false } = args;

    // Mock file listing
    const mockFiles = [
      { name: 'file1.txt', type: 'file', size: 1024 },
      { name: 'file2.js', type: 'file', size: 2048 },
      { name: 'folder', type: 'directory' },
    ];

    if (recursive) {
      mockFiles.push(
        { name: 'folder/nested.txt', type: 'file', size: 512 }
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockFiles, null, 2),
        },
      ],
    };
  }

  /**
   * Handle system info tool
   */
  private async handleSystemInfo(args: any) {
    const { type = 'all' } = args;

    const info: Record<string, any> = {};

    if (type === 'all' || type === 'platform') {
      info.platform = process.platform;
      info.arch = process.arch;
    }

    if (type === 'all' || type === 'env') {
      info.nodeVersion = process.version;
      info.pid = process.pid;
    }

    if (type === 'all' || type === 'version') {
      info.serverVersion = '1.0.0';
      info.apiVersion = '0.4.0';
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(info, null, 2),
        },
      ],
    };
  }

  /**
   * Handle env get tool
   */
  private async handleEnvGet(args: any) {
    const { name } = args;

    const value = process.env[name];

    if (value === undefined) {
      return {
        content: [
          {
            type: 'text',
            text: `Environment variable '${name}' is not set`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `${name}=${value}`,
        },
      ],
    };
  }

  /**
   * Basic SQL validation
   */
  private isValidSql(sql: string): boolean {
    // Production would use proper SQL parsing
    const forbidden = ['DROP', 'DELETE', 'TRUNCATE'];
    const upperSql = sql.toUpperCase();
    return !forbidden.some(cmd => upperSql.includes(cmd));
  }

  /**
   * Run the server
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Example MCP server running on stdio');
  }
}

// Start the server
const server = new ExampleMCPServer();
server.run().catch(console.error);
