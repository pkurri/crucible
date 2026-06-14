---
name: cms-headless-builder
description:
  Headless CMS builder with content modeling, rich text editing, media
  management, and API delivery. Use when building content management systems,
  creating editorial workflows, managing digital assets, or delivering content
  via APIs.
triggers:
  - 'CMS'
  - 'headless CMS'
  - 'content management'
  - 'content modeling'
  - 'rich text'
  - 'Strapi'
  - 'Contentful'
---

# Headless CMS Builder

Build headless content management systems with flexible content modeling.

## Capabilities

- **Content Modeling**: Custom schemas
- **Rich Text**: Block-based editor
- **Media**: Asset management
- **Localization**: Multi-language
- **APIs**: REST & GraphQL

## Usage

```markdown
@skill cms-headless-builder

Create a headless CMS:

- Content types: Articles, Products, Pages
- Rich text: Markdown + blocks
- Media: Image optimization
- API: GraphQL
```

## Content Modeling

```typescript
// Define content types
const contentTypes = {
  article: {
    name: 'Article',
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        validations: {maxLength: 200},
      },
      {
        name: 'slug',
        type: 'slug',
        required: true,
        pattern: '^[a-z0-9-]+$',
      },
      {
        name: 'content',
        type: 'rich-text',
        required: true,
      },
      {
        name: 'author',
        type: 'reference',
        reference: 'author',
        required: true,
      },
      {
        name: 'tags',
        type: 'array',
        items: {type: 'text'},
      },
      {
        name: 'featuredImage',
        type: 'asset',
        mimeTypes: ['image/*'],
      },
      {
        name: 'publishedAt',
        type: 'datetime',
      },
    ],
  },
}
```

## Rich Text Editor

```typescript
// Block-based editor
import { RichTextEditor } from '@crucible/cms';

const initialContent = {
  blocks: [
    {
      type: 'heading',
      level: 1,
      content: 'Article Title'
    },
    {
      type: 'paragraph',
      content: 'Introduction paragraph...'
    },
    {
      type: 'image',
      url: 'https://cdn.example.com/image.jpg',
      caption: 'Image caption'
    },
    {
      type: 'code',
      language: 'typescript',
      code: 'console.log("Hello")'
    }
  ]
};

function Editor() {
  return (
    <RichTextEditor
      content={initialContent}
      onChange={(content) => saveContent(content)}

      // Plugins
      plugins={[
        'heading',
        'paragraph',
        'image',
        'code',
        'embed',
        'table'
      ]}
    />
  );
}
```

## API Delivery

```typescript
// GraphQL API
const typeDefs = gql`
  type Article {
    id: ID!
    title: String!
    slug: String!
    content: RichText!
    author: Author!
    tags: [String!]!
    featuredImage: Asset
    publishedAt: DateTime
  }

  type Query {
    articles(
      filter: ArticleFilter
      sort: ArticleSort
      limit: Int
      offset: Int
    ): [Article!]!

    article(slug: String!): Article
  }
`

// REST API
app.get('/api/articles', async (req, res) => {
  const {filter, sort, limit, offset} = req.query

  const articles = await cms.getArticles({
    filter,
    sort,
    pagination: {limit, offset},
  })

  res.json(articles)
})
```

## Media Management

```typescript
// Upload and transform images
const uploadImage = async (file: File) => {
  const asset = await cms.uploadAsset(file, {
    // Auto-optimize
    optimization: {
      format: 'webp',
      quality: 80
    },

    // Generate variants
    variants: [
      { name: 'thumbnail', width: 300, height: 200 },
      { name: 'medium', width: 800 },
      { name: 'large', width: 1600 }
    ]
  });

  return asset;
};

// Responsive images
<Image
  src={asset.url}
  variants={asset.variants}
  sizes="(max-width: 800px) 100vw, 800px"
/>
```

## Localization

```typescript
// Multi-language content
const article = {
  id: 'article-1',
  translations: {
    en: {
      title: 'English Title',
      content: '...',
    },
    es: {
      title: 'Título en Español',
      content: '...',
    },
    fr: {
      title: 'Titre en Français',
      content: '...',
    },
  },
}

// Query with locale
const localizedArticle = await cms.getArticle({
  id: 'article-1',
  locale: 'es',
  fallback: 'en',
})
```

## Features

- **Draft/Publish**: Editorial workflow
- **Versioning**: Content history
- **Preview**: Before publishing
- **SEO**: Meta fields
- **Webhooks**: External integrations
- **Search**: Full-text search
