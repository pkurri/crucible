# Crucible Web - Setup Guide

## Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd crucible/templates/006-crucible-web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## What's Included

### ✅ Core Features Implemented

1. **Homepage** (`/`)
   - Hero section with gradient design
   - Feature cards showcasing Skills, Agent Teams, and Performance Insights
   - Stats section displaying key metrics
   - Responsive navigation

2. **Skills Browser** (`/skills`)
   - Search functionality across skill names, descriptions, and triggers
   - Category filtering (All, Workflows, Tools, Patterns)
   - Responsive grid layout with glassmorphism cards
   - Mock data for 6 skills (ready to connect to real data)

3. **Design System**
   - Tailwind CSS with custom configuration
   - Dark mode support
   - Glassmorphism effects
   - shadcn/ui component library (ready to add components)
   - Lucide React icons

4. **Type Safety**
   - Full TypeScript support
   - Type definitions for Skills, Agents, Messages, Metrics
   - Strict type checking enabled

### 🚧 Ready to Build

The following pages are ready for implementation:

1. **Agent Orchestration** (`/agents`)
   - Visual agent team builder
   - Role assignment interface
   - Communication dashboard
   - Dependency management

2. **Performance Monitoring** (`/monitoring`)
   - Real-time metrics dashboard
   - Agent performance charts (using Recharts)
   - Collaboration analytics
   - Alert system

3. **API Routes** (`/api/*`)
   - Skills data endpoint
   - Agent management endpoints
   - Metrics collection endpoints

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── skills/
│       └── page.tsx          # Skills browser
├── components/               # React components (add shadcn/ui here)
├── lib/
│   └── utils.ts             # Utility functions
└── types/
    └── index.ts             # TypeScript definitions
```

## Adding shadcn/ui Components

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
```

## Connecting to Real Data

### Option 1: File System (Static)

Read skills from the `../../skills/` directory:

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function getSkills() {
  const skillsDir = path.join(process.cwd(), '../../skills')
  const skillFolders = fs.readdirSync(skillsDir)

  const skills = skillFolders.map(folder => {
    const skillPath = path.join(skillsDir, folder, 'SKILL.md')
    const fileContents = fs.readFileSync(skillPath, 'utf8')
    const {data, content} = matter(fileContents)

    return {
      id: folder,
      name: data.name,
      description: data.description,
      triggers: data.triggers,
      content,
    }
  })

  return skills
}
```

### Option 2: Database (Dynamic)

Set up Drizzle ORM with PostgreSQL:

```bash
# Install dependencies
npm install drizzle-orm postgres

# Set up database schema
npm run db:generate
npm run db:migrate
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t crucible-web .

# Run container
docker run -p 3000:3000 crucible-web
```

## Next Steps

1. **Add More Pages**
   - Create `/agents` page for agent orchestration
   - Create `/monitoring` page for performance dashboards
   - Add individual skill detail pages

2. **Connect Real Data**
   - Implement file system reading for skills
   - Set up database for dynamic data
   - Create API routes for data fetching

3. **Add Components**
   - Install shadcn/ui components
   - Build reusable UI components
   - Add charts and visualizations

4. **Enhance Features**
   - Add authentication with NextAuth
   - Implement real-time updates with WebSockets
   - Add agent communication interface

## Troubleshooting

### TypeScript Errors

All TypeScript errors showing "Cannot find module" are expected before running
`npm install`. They will resolve once dependencies are installed.

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Recharts](https://recharts.org/)
