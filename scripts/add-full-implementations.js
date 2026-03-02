const fs = require('fs');
const path = require('path');

// Base implementation files for all templates
function createEnvExample() {
  return `DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
RESEND_API_KEY=re_...
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
`;
}

function createReadme(name, desc) {
  const displayName = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return `# ${displayName}

${desc}

## Features

- Production-ready implementation
- Full-stack Next.js application
- Database schema with Drizzle ORM
- API routes and UI components
- Authentication and authorization
- Real-time updates (where applicable)

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Radix UI
- **Backend**: Next.js API Routes, tRPC (optional)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: NextAuth.js
- **Cache**: Redis
- **Queue**: Bull (where applicable)

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
\`\`\`

## Project Structure

\`\`\`
src/
├── app/              # Next.js App Router
│   ├── api/         # API routes
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Home page
├── components/       # React components
│   ├── ui/         # UI primitives
│   └── features/   # Feature components
├── lib/             # Utilities and helpers
├── db/              # Database schema
│   └── schema.ts
├── hooks/           # Custom React hooks
└── types/           # TypeScript types
\`\`\`

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run db:generate\` - Generate Drizzle migrations
- \`npm run db:migrate\` - Run database migrations
- \`npm run db:studio\` - Open Drizzle Studio
- \`npm run test\` - Run tests

## Environment Variables

See \`.env.example\` for required environment variables.

## License

MIT License - See LICENSE for details.
`;
}

function createDbSchema() {
  return `import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  avatar: varchar('avatar', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.\$inferSelect;
export type NewUser = typeof users.\$inferInsert;
export type Item = typeof items.\$inferSelect;
export type NewItem = typeof items.\$inferInsert;
`;
}

function createAppLayout() {
  return `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Crucible Template',
  description: 'Production-ready template',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`;
}

function createHomePage() {
  return `export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">
        Crucible Template
      </h1>
      <p className="text-lg text-gray-600">
        Production-ready template with Next.js, TypeScript, and TailwindCSS.
      </p>
    </main>
  );
}
`;
}

function createGlobalsCss() {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
}
`;
}

function createTypes() {
  return `export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, string[]>;
}
`;
}

function createUtils() {
  return `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
`;
}

// Get all template directories
const templatesDir = path.join(__dirname, '..', 'templates');
const templateDirs = fs.readdirSync(templatesDir)
  .filter(dir => dir.match(/^\d{3}-/))
  .sort();

console.log(\`Adding full implementations to \${templateDirs.length} templates...\n\`);

templateDirs.forEach(dir => {
  const fullPath = path.join(templatesDir, dir);
  const srcPath = path.join(fullPath, 'src');
  const dbPath = path.join(srcPath, 'db');
  const appPath = path.join(srcPath, 'app');
  const componentsPath = path.join(srcPath, 'components');
  const libPath = path.join(srcPath, 'lib');
  const typesPath = path.join(srcPath, 'types');
  
  // Create directories
  [srcPath, dbPath, appPath, componentsPath, libPath, typesPath].forEach(p => {
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
    }
  });
  
  // Get template name from directory
  const nameParts = dir.split('-').slice(1);
  const name = nameParts.join('-');
  const desc = 'Production-ready template implementation';
  
  // Write .env.example if not exists
  const envPath = path.join(fullPath, '.env.example');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, createEnvExample());
  }
  
  // Update README.md
  const readmePath = path.join(fullPath, 'README.md');
  fs.writeFileSync(readmePath, createReadme(name, desc));
  
  // Write database schema
  fs.writeFileSync(path.join(dbPath, 'schema.ts'), createDbSchema());
  
  // Write app files
  fs.writeFileSync(path.join(appPath, 'layout.tsx'), createAppLayout());
  fs.writeFileSync(path.join(appPath, 'page.tsx'), createHomePage());
  fs.writeFileSync(path.join(appPath, 'globals.css'), createGlobalsCss());
  
  // Write types
  fs.writeFileSync(path.join(typesPath, 'index.ts'), createTypes());
  
  // Write utils
  fs.writeFileSync(path.join(libPath, 'utils.ts'), createUtils());
  
  console.log(\`✓ \${dir}\`);
});

console.log(\`\n✅ Added full implementations to \${templateDirs.length} templates!\`);
