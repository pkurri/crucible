---
name: developer-portal-builder
description: Developer portal and API documentation platform with interactive API explorer, code samples, and authentication guides. Use when building developer portals, creating API documentation, setting up API marketplaces, or managing API keys.
triggers:
  - "developer portal"
  - "API documentation"
  - "API explorer"
  - "documentation"
  - "API reference"
---

# Developer Portal Builder

Create developer portals with API documentation, interactive explorer, and code samples.

## Capabilities

- **API Explorer**: Interactive testing
- **Code Samples**: Multi-language examples
- **Authentication**: Setup guides
- **SDKs**: Auto-generated clients
- **Changelog**: Version history

## Usage

```markdown
@skill developer-portal-builder

Create a developer portal:
- APIs: REST, GraphQL
- Languages: JavaScript, Python, Go
- Features: Interactive playground
- Auth: JWT, API keys
```

## OpenAPI Integration

```typescript
// Load OpenAPI spec
const spec = await loadOpenAPISpec('./openapi.yaml');

// Generate documentation
const docs = generateDocs(spec, {
  theme: 'dark',
  layout: 'three-panel',
  
  // Features
  tryItOut: true,
  codeSamples: ['javascript', 'python', 'curl'],
  
  // Customization
  logo: '/logo.svg',
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981'
  }
});
```

## Interactive API Explorer

```typescript
// APIPlayground.tsx
export function APIPlayground({ endpoint }: { endpoint: Endpoint }) {
  const [request, setRequest] = useState({
    method: endpoint.method,
    url: endpoint.path,
    headers: {},
    body: endpoint.exampleRequest
  });
  
  const [response, setResponse] = useState<Response | null>(null);
  
  const executeRequest = async () => {
    const res = await fetch(request.url, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...request.headers
      },
      body: JSON.stringify(request.body)
    });
    
    setResponse({
      status: res.status,
      headers: Object.fromEntries(res.headers),
      body: await res.json()
    });
  };
  
  return (
    <div className="api-playground">
      <RequestBuilder
        request={request}
        onChange={setRequest}
      />
      <button onClick={executeRequest}>
        Send Request
      </button>
      {response && <ResponseViewer response={response} />}
    </div>
  );
}
```

## Code Samples

```typescript
// Generate SDK examples
const samples = {
  javascript: `
import { Client } from '@yourcompany/sdk';

const client = new Client({
  apiKey: 'your-api-key'
});

const user = await client.users.create({
  name: 'John Doe',
  email: 'john@example.com'
});
`,
  python: `
from yourcompany import Client

client = Client(api_key='your-api-key')

user = client.users.create(
    name='John Doe',
    email='john@example.com'
)
`,
  curl: `
curl -X POST https://api.example.com/users \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
`
};
```

## Authentication Guide

```markdown
## Authentication

All API requests require authentication using an API key.

### API Keys

Include your API key in the Authorization header:

\`\`\`http
Authorization: Bearer YOUR_API_KEY
\`\`\`

### Getting an API Key

1. Sign up at [Dashboard](https://dashboard.example.com)
2. Navigate to Settings > API Keys
3. Click "Generate New Key"

### Scopes

API keys have the following scopes:
- `read`: Read access to resources
- `write`: Create and update resources
- `admin`: Full access including deletes
```

## Features

- **Search**: Full-text search
- **Versioning**: Multi-version docs
- **Changelog**: Auto-generated
- **Feedback**: Rate documentation
- **Analytics**: Popular endpoints

## Integration

- ReadMe: Hosted solution
- Mintlify: Modern docs
- Docusaurus: Open source
- Stoplight: Design-first
- Swagger UI: OpenAPI
