# Crucible MCP (Model Context Protocol) Servers

**Version:** 1.0.0  
**Last Updated:** February 27, 2026

---

## Overview

Crucible MCP (Model Context Protocol) servers provide standardized interfaces
for AI models to interact with external tools, services, and data sources. Each
MCP server exposes capabilities through a well-defined protocol that enables
secure, structured communication between AI agents and external systems.

---

## What is MCP?

Model Context Protocol (MCP) is an open protocol that enables:

- **Standardized Tool Integration** - Consistent interface for external tools
- **Secure Execution** - Sandboxed environment for tool execution
- **Structured Communication** - JSON-RPC based message protocol
- **Capability Discovery** - Automatic tool discovery and introspection
- **Multi-Model Support** - Works with Claude, GPT, and other AI models

---

## MCP Architecture

### Core Components

```
┌─────────────────┐      ┌─────────────┐      ┌─────────────────┐
│   AI Model      │◄────►│  MCP Server │◄────►│  External Tool  │
│  (Claude/GPT)   │      │  (Crucible) │      │  (Service/API)  │
└─────────────────┘      └─────────────┘      └─────────────────┘
```

### Protocol Flow

1. **Discovery** - AI model queries available tools
2. **Invocation** - AI model requests tool execution
3. **Execution** - MCP server processes the request
4. **Response** - Results returned to AI model
5. **Context** - Results added to conversation context

---

## Directory Structure

```
mcps/
├── servers/                   # MCP server implementations
│   ├── cloudflare/           # Cloudflare Workers/KV/R2/D1
│   ├── stripe/              # Stripe payment processing
│   ├── supabase/            # Supabase database/auth
│   ├── neon/                # Neon Postgres
│   ├── github/              # GitHub API
│   ├── vercel/              # Vercel deployment
│   ├── aws/                 # AWS services
│   ├── openai/              # OpenAI API
│   ├── anthropic/           # Anthropic API
│   └── ...                  # Additional servers
├── core/                      # MCP core framework
│   ├── server.ts            # Base server implementation
│   ├── transport.ts         # Transport layer (stdio/sse)
│   ├── protocol.ts          # MCP protocol implementation
│   ├── tools.ts             # Tool registration and execution
│   └── auth.ts              # Authentication handling
├── sdk/                       # MCP SDK for developers
│   ├── typescript/          # TypeScript SDK
│   ├── python/              # Python SDK
│   └── rust/                # Rust SDK
├── schemas/                   # JSON schemas
│   ├── protocol.json        # Protocol schema
│   └── tool-schema.json     # Tool definition schema
├── examples/                  # Example implementations
│   ├── custom-server/       # Custom MCP server example
│   └── tool-definition/     # Tool definition examples
└── README.md                  # This file
```

---

## Using MCP Servers

### Installation

```bash
# Install an MCP server
npm install @crucible/mcp-stripe

# Or install all servers
npm install @crucible/mcp-all
```

### Configuration

Create `.crucible/mcp.json` in your project:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": ["@crucible/mcp-stripe"],
      "env": {
        "STRIPE_API_KEY": "${STRIPE_SECRET_KEY}"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["@crucible/mcp-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_KEY": "${SUPABASE_SERVICE_KEY}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["@crucible/mcp-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Claude Code Integration

Claude Code automatically discovers and uses MCP servers:

```bash
# Start with MCP servers
claude --mcp-servers stripe,supabase,github

# Or configure in .claude/settings.json
{
  "mcpServers": ["stripe", "supabase", "github"]
}
```

---

## Available MCP Servers

### Cloud Services

| Server           | Description                    | Tools     |
| ---------------- | ------------------------------ | --------- |
| `mcp-cloudflare` | Cloudflare Workers, KV, R2, D1 | 15+ tools |
| `mcp-aws`        | AWS S3, Lambda, RDS, etc.      | 25+ tools |
| `mcp-gcp`        | Google Cloud Platform          | 20+ tools |
| `mcp-azure`      | Microsoft Azure services       | 18+ tools |

### Database & Storage

| Server         | Description              | Tools     |
| -------------- | ------------------------ | --------- |
| `mcp-supabase` | Supabase Postgres & Auth | 12+ tools |
| `mcp-neon`     | Neon Serverless Postgres | 8+ tools  |
| `mcp-mongodb`  | MongoDB operations       | 10+ tools |
| `mcp-redis`    | Redis cache operations   | 6+ tools  |

### Payment & Commerce

| Server        | Description              | Tools     |
| ------------- | ------------------------ | --------- |
| `mcp-stripe`  | Stripe payments          | 20+ tools |
| `mcp-shopify` | Shopify store management | 15+ tools |
| `mcp-paypal`  | PayPal integration       | 8+ tools  |

### Development Tools

| Server           | Description                      | Tools     |
| ---------------- | -------------------------------- | --------- |
| `mcp-github`     | GitHub repositories, issues, PRs | 25+ tools |
| `mcp-gitlab`     | GitLab integration               | 20+ tools |
| `mcp-vercel`     | Vercel deployments               | 10+ tools |
| `mcp-docker`     | Docker container management      | 12+ tools |
| `mcp-kubernetes` | K8s cluster operations           | 15+ tools |

### AI & ML Services

| Server            | Description                 | Tools     |
| ----------------- | --------------------------- | --------- |
| `mcp-openai`      | OpenAI GPT, DALL-E, Whisper | 8+ tools  |
| `mcp-anthropic`   | Claude API operations       | 6+ tools  |
| `mcp-huggingface` | Hugging Face models         | 10+ tools |

### Communication

| Server        | Description            | Tools     |
| ------------- | ---------------------- | --------- |
| `mcp-slack`   | Slack messaging        | 12+ tools |
| `mcp-discord` | Discord bot operations | 10+ tools |
| `mcp-resend`  | Email sending          | 5+ tools  |
| `mcp-twilio`  | SMS and voice          | 8+ tools  |

---

## Creating Custom MCP Servers

### 1. Server Structure

```
my-mcp-server/
├── src/
│   ├── index.ts          # Server entry point
│   ├── tools/            # Tool implementations
│   │   ├── index.ts
│   │   └── *.ts
│   ├── handlers/         # Request handlers
│   │   ├── initialize.ts
│   │   ├── tools-list.ts
│   │   └── tools-call.ts
│   └── types.ts          # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

### 2. Basic Server Implementation

```typescript
// src/index.ts
import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

class MyMCPServer {
  private server: Server

  constructor() {
    this.server = new Server(
      {
        name: 'my-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    this.setupHandlers()
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'my_tool',
            description: 'Description of what this tool does',
            inputSchema: {
              type: 'object',
              properties: {
                param1: {
                  type: 'string',
                  description: 'Description of param1',
                },
              },
              required: ['param1'],
            },
          },
        ],
      }
    })

    // Execute tool
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      if (request.params.name === 'my_tool') {
        const {param1} = request.params.arguments

        // Implement tool logic
        const result = await this.myToolLogic(param1)

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      throw new Error(`Unknown tool: ${request.params.name}`)
    })
  }

  private async myToolLogic(param1: string): Promise<any> {
    // Tool implementation
    return {result: `Processed: ${param1}`}
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('MCP server running on stdio')
  }
}

const server = new MyMCPServer()
server.run().catch(console.error)
```

### 3. Tool Definition

```typescript
// src/tools/index.ts
export interface ToolDefinition {
  name: string
  description: string
  inputSchema: object
  handler: (args: any) => Promise<any>
}

export const tools: ToolDefinition[] = [
  {
    name: 'database_query',
    description: 'Execute a database query',
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
          items: {type: 'string'},
        },
      },
      required: ['sql'],
    },
    handler: async args => {
      // Implementation
      return {rows: []}
    },
  },
]
```

### 4. Package and Publish

```json
// package.json
{
  "name": "@crucible/mcp-my-server",
  "version": "1.0.0",
  "description": "My custom MCP server",
  "type": "module",
  "bin": {
    "mcp-my-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0"
  }
}
```

---

## MCP Protocol Reference

### Request Types

```typescript
// Initialize
interface InitializeRequest {
  jsonrpc: '2.0'
  id: number
  method: 'initialize'
  params: {
    protocolVersion: string
    capabilities: object
    clientInfo: {
      name: string
      version: string
    }
  }
}

// List Tools
interface ListToolsRequest {
  jsonrpc: '2.0'
  id: number
  method: 'tools/list'
}

// Call Tool
interface CallToolRequest {
  jsonrpc: '2.0'
  id: number
  method: 'tools/call'
  params: {
    name: string
    arguments: object
  }
}
```

### Response Types

```typescript
// Tool List Response
interface ListToolsResponse {
  jsonrpc: '2.0'
  id: number
  result: {
    tools: ToolDefinition[]
  }
}

// Tool Call Response
interface CallToolResponse {
  jsonrpc: '2.0'
  id: number
  result: {
    content: Array<{
      type: 'text' | 'image' | 'resource'
      [key: string]: any
    }>
    isError?: boolean
  }
}
```

---

## Security Best Practices

### 1. Authentication

```typescript
// src/auth.ts
export class AuthManager {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.MCP_API_KEY || ''
  }

  validateRequest(request: any): boolean {
    // Validate API key or token
    return request.headers?.authorization === `Bearer ${this.apiKey}`
  }
}
```

### 2. Input Validation

```typescript
// Validate tool inputs
import {z} from 'zod'

const QuerySchema = z.object({
  sql: z.string().max(1000),
  params: z.array(z.string()).optional(),
})

export function validateInput(args: unknown) {
  return QuerySchema.parse(args)
}
```

### 3. Rate Limiting

```typescript
// src/rate-limiter.ts
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  checkLimit(clientId: string, maxRequests: number = 100): boolean {
    const now = Date.now()
    const window = 60 * 1000 // 1 minute

    const requests = this.requests.get(clientId) || []
    const recent = requests.filter(t => now - t < window)

    if (recent.length >= maxRequests) {
      return false
    }

    recent.push(now)
    this.requests.set(clientId, recent)
    return true
  }
}
```

---

## Testing MCP Servers

```typescript
// tests/server.test.ts
import {MyMCPServer} from '../src/index'
import {Client} from '@modelcontextprotocol/sdk/client/index.js'
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js'

describe('MyMCPServer', () => {
  let client: Client
  let server: MyMCPServer

  beforeEach(async () => {
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair()

    server = new MyMCPServer()
    await server.connect(serverTransport)

    client = new Client({name: 'test-client', version: '1.0.0'})
    await client.connect(clientTransport)
  })

  it('should list tools', async () => {
    const tools = await client.listTools()
    expect(tools.tools).toHaveLength(1)
  })

  it('should execute tool', async () => {
    const result = await client.callTool('my_tool', {param1: 'test'})
    expect(result.content[0].text).toContain('Processed')
  })
})
```

---

## Resources

- **MCP Specification:** https://modelcontextprotocol.io
- **SDK Documentation:** https://github.com/modelcontextprotocol
- **Example Servers:** https://github.com/pkurri/crucible/tree/main/mcps

---

## Contributing

To contribute an MCP server:

1. Fork the `pkurri/crucible` repository
2. Create your server in `servers/your-server-name/`
3. Include tests and documentation
4. Submit a pull request

---

## License

MIT License - See [LICENSE](../LICENSE) for details.
