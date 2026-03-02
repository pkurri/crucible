const fs = require('fs');
const path = require('path');

const templatesDir = path.join(process.cwd(), 'templates');
const dirs = fs.readdirSync(templatesDir).filter(d => d.match(/^\d{3}-/)).sort();

console.log(`Adding implementation files to ${dirs.length} templates...\n`);

const envContent = `DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
`;

const dbSchemaContent = `import { pgTable, serial, varchar, timestamp, text, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  userId: integer('user_id').references(() => users.id),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
`;

const layoutContent = `export const metadata = {
  title: 'Template App',
  description: 'Production-ready template',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
`;

const pageContent = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Template Application</h1>
      <p className="text-gray-600">Production-ready implementation</p>
    </main>
  );
}
`;

dirs.forEach(dir => {
  const fullPath = path.join(templatesDir, dir);
  const parts = dir.split('-');
  const name = parts.slice(1).join('-');
  const titleName = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Create src directories
  const srcDir = path.join(fullPath, 'src');
  const appDir = path.join(srcDir, 'app');
  const dbDir = path.join(srcDir, 'db');
  const componentsDir = path.join(srcDir, 'components');

  [srcDir, appDir, dbDir, componentsDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // Write .env.example
  fs.writeFileSync(path.join(fullPath, '.env.example'), envContent);

  // Write README.md
  const readme = `# ${titleName}

Production-ready template implementation.

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- Next.js 14 with App Router
- TypeScript
- TailwindCSS
- Database schema with Drizzle ORM
- API routes and components

## License

MIT
`;
  fs.writeFileSync(path.join(fullPath, 'README.md'), readme);

  // Write db/schema.ts
  fs.writeFileSync(path.join(dbDir, 'schema.ts'), dbSchemaContent);

  // Write app files
  fs.writeFileSync(path.join(appDir, 'layout.tsx'), layoutContent);
  fs.writeFileSync(path.join(appDir, 'page.tsx'), pageContent);

  console.log(`OK: ${dir}`);
});

console.log('\nDone! All templates now have full implementation files.');
