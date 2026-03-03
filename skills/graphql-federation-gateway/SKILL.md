---
name: graphql-federation-gateway
description:
  GraphQL Federation Gateway for composing multiple GraphQL microservices into a
  unified schema. Use when building federated GraphQL architectures, composing
  multiple services, implementing schema stitching, or setting up Apollo
  Federation.
triggers:
  - 'GraphQL'
  - 'federation'
  - 'gateway'
  - 'schema stitching'
  - 'Apollo'
  - 'microservices'
---

# GraphQL Federation Gateway

Federated GraphQL architecture for composing multiple services into a unified
schema.

## Capabilities

- **Federation**: Compose microservices
- **Gateway**: Unified entry point
- **Schema Stitching**: Merge schemas
- **Query Planning**: Optimize execution
- **Subgraphs**: Independent services

## Usage

```markdown
@skill graphql-federation-gateway

Set up GraphQL Federation:

- Gateway: Apollo Gateway
- Subgraphs: Users, Orders, Products
- Auth: JWT
- Tracing: OpenTelemetry
```

## Gateway Setup

```typescript
// gateway.ts
import {ApolloGateway, IntrospectAndCompose} from '@apollo/gateway'
import {ApolloServer} from '@apollo/server'

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      {name: 'users', url: 'http://users:4001/graphql'},
      {name: 'orders', url: 'http://orders:4002/graphql'},
      {name: 'products', url: 'http://products:4003/graphql'},
    ],
  }),
})

const server = new ApolloServer({
  gateway,
  introspection: true,
})
```

## Subgraph Definition

```typescript
// subgraphs/users/index.ts
import {ApolloServer} from '@apollo/server'
import {buildSubgraphSchema} from '@apollo/subgraph'
import {gql} from 'graphql-tag'

const typeDefs = gql`
  extend type Query {
    user(id: ID!): User
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    email: String!
    name: String
    orders: [Order] @external
  }
`

const resolvers = {
  Query: {
    user: (_, {id}) => db.users.findById(id),
    me: (_, __, {user}) => db.users.findById(user.id),
  },

  User: {
    orders: user => ({
      __typename: 'Order',
      userId: user.id,
    }),
  },
}

const server = new ApolloServer({
  schema: buildSubgraphSchema({typeDefs, resolvers}),
})
```

## Entity Resolution

```typescript
// Resolving references between subgraphs
const resolvers = {
  Order: {
    user: {
      resolveReference: async order => {
        return db.users.findById(order.userId)
      },
    },
  },
}
```

## Query Example

```graphql
query GetUserWithOrders {
  me {
    id
    name
    email
    orders {
      id
      total
      items {
        product {
          name
          price
        }
        quantity
      }
    }
  }
}
```

## Authentication

```typescript
const server = new ApolloServer({
  gateway,
  context: async ({req}) => {
    const token = req.headers.authorization || ''
    const user = await validateToken(token)

    return {user}
  },
})
```

## Features

- **Query Cost Analysis**: Prevent expensive queries
- **Persisted Queries**: Cache common queries
- **Tracing**: Apollo Studio integration
- **Metrics**: Query performance
- **Caching**: Response caching

## Best Practices

1. **Entity Keys**: Use stable identifiers
2. **Schema Design**: Follow federation specs
3. **Error Handling**: Graceful degradation
4. **Monitoring**: Track subgraph health
5. **Versioning**: Backward compatible changes
