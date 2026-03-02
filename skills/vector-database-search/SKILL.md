---
name: vector-database-search
description: Vector database integration with Pinecone, Weaviate, and pgvector for semantic search, recommendations, and AI-powered retrieval. Use when implementing semantic search, building recommendation engines, creating vector embeddings, or setting up RAG systems.
triggers:
  - "vector search"
  - "semantic search"
  - "embeddings"
  - "Pinecone"
  - "Weaviate"
  - "pgvector"
  - "RAG"
---

# Vector Database Search

Semantic search and recommendations with vector embeddings.

## Capabilities

- **Embeddings**: Generate and store vectors
- **Similarity Search**: Cosine, Euclidean
- **Hybrid Search**: Vector + keyword
- **Filtering**: Metadata filtering
- **RAG**: Retrieval Augmented Generation

## Usage

```markdown
@skill vector-database-search

Set up semantic search:
- Database: Pinecone
- Model: OpenAI text-embedding-3-small
- Use case: Product recommendations
- Index: 1536 dimensions
```

## Embedding Generation

```typescript
import { OpenAIEmbeddings } from '@crucible/ai';

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
  dimensions: 1536
});

// Generate embedding
const vector = await embeddings.create(
  'Machine learning is a subset of AI'
);

// Batch generation
const texts = [
  'Product A description',
  'Product B description',
  'Product C description'
];

const vectors = await embeddings.createBatch(texts);
```

## Vector Database

```typescript
import { PineconeClient } from '@crucible/vector';

const db = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY,
  environment: 'us-west1-gcp'
});

// Create index
const index = await db.createIndex({
  name: 'products',
  dimension: 1536,
  metric: 'cosine',
  spec: {
    pod: {
      environment: 'us-west1-gcp',
      podType: 'p1.x1'
    }
  }
});

// Insert vectors
await index.upsert({
  vectors: [
    {
      id: 'product-1',
      values: vector,
      metadata: {
        category: 'electronics',
        price: 299.99,
        brand: 'Apple'
      }
    }
  ]
});
```

## Semantic Search

```typescript
// Search similar items
const results = await index.query({
  vector: queryVector,
  topK: 10,
  includeMetadata: true,
  filter: {
    category: { $eq: 'electronics' },
    price: { $lte: 500 }
  }
});

// Returns similar products
results.matches.forEach(match => {
  console.log(`${match.metadata.name}: ${match.score}`);
});
```

## Hybrid Search

```typescript
// Combine vector + keyword search
const results = await index.hybridSearch({
  vector: queryVector,
  sparseVector: {
    indices: [0, 1, 2],
    values: [0.5, 0.3, 0.2]
  },
  alpha: 0.7, // Weight for dense vs sparse
  topK: 10
});
```

## RAG Implementation

```typescript
// Retrieval Augmented Generation
async function ragQuery(question: string) {
  // 1. Generate embedding for question
  const questionVector = await embeddings.create(question);
  
  // 2. Retrieve relevant documents
  const docs = await index.query({
    vector: questionVector,
    topK: 5,
    includeMetadata: true
  });
  
  // 3. Build context
  const context = docs.matches
    .map(m => m.metadata.content)
    .join('\n\n');
  
  // 4. Generate answer
  const answer = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Answer based on context: ${context}`
      },
      {
        role: 'user',
        content: question
      }
    ]
  });
  
  return answer.choices[0].message.content;
}
```

## Features

- **Multi-modal**: Text, image, audio vectors
- **Namespaces**: Logical separation
- **Metadata**: Structured filtering
- **Batch Operations**: Bulk insert/delete
- **Real-time**: Live index updates

## Integration

- OpenAI: Embeddings
- Hugging Face: Open models
- Pinecone: Managed service
- Weaviate: Open source
- pgvector: Postgres extension
