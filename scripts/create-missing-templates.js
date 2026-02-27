const fs = require('fs');
const path = require('path');

const templates = [
  {
    number: '046',
    name: 'subscription-management',
    title: 'Subscription Management',
    category: 'SaaS',
    description: 'Recurring billing and subscription platform'
  },
  {
    number: '051',
    name: 'event-driven-microservices',
    title: 'Event-Driven Microservices',
    category: 'SaaS',
    description: 'Kafka-based event architecture'
  },
  {
    number: '058',
    name: 'api-gateway-kong',
    title: 'API Gateway Kong',
    category: 'Security',
    description: 'Rate limiting and authentication proxy'
  },
  {
    number: '061',
    name: 'security-audit-platform',
    title: 'Security Audit Platform',
    category: 'Security',
    description: 'Compliance monitoring and reporting'
  },
  {
    number: '071',
    name: 'real-time-analytics-engine',
    title: 'Real-Time Analytics',
    category: 'Analytics',
    description: 'Clickstream processing with Apache Flink'
  },
  {
    number: '076',
    name: 'pwa-progressive-web-app',
    title: 'Progressive Web App',
    category: 'Analytics',
    description: 'Offline-first with service workers'
  },
  {
    number: '081',
    name: 'ci-cd-orchestrator',
    title: 'CI/CD Orchestrator',
    category: 'DevOps',
    description: 'GitHub Actions/GitLab CI pipeline builder'
  },
  {
    number: '084',
    name: 'terraform-infrastructure-generator',
    title: 'Terraform Generator',
    category: 'DevOps',
    description: 'Infrastructure-as-code scaffolding'
  },
  {
    number: '087',
    name: 'graphql-federation-gateway',
    title: 'GraphQL Federation',
    category: 'DevOps',
    description: 'Apollo Federation gateway'
  },
  {
    number: '092',
    name: 'serverless-functions-platform',
    title: 'Serverless Platform',
    category: 'DevOps',
    description: 'Lambda/Cloud Functions management'
  },
  {
    number: '094',
    name: 'e-commerce-platform',
    title: 'E-Commerce Platform',
    category: 'Web/Mobile',
    description: 'Multi-vendor marketplace with payments'
  },
  {
    number: '097',
    name: 'video-streaming-platform',
    title: 'Video Streaming',
    category: 'Web/Mobile',
    description: 'HLS/DASH adaptive bitrate streaming'
  },
  {
    number: '099',
    name: 'collaborative-whiteboard',
    title: 'Collaborative Whiteboard',
    category: 'Web/Mobile',
    description: 'Excalidraw-style canvas with CRDTs'
  }
];

const templatesDir = path.join(process.cwd(), 'templates');

console.log('Creating missing templates...\n');

templates.forEach(template => {
  const templateDir = path.join(templatesDir, `${template.number}-${template.name}`);
  
  // Create directory
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }
  
  // Create package.json
  const packageJson = {
    name: template.name,
    version: "1.0.0",
    description: template.description,
    main: "src/app/page.tsx",
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint"
    },
    dependencies: {
      next: "^14.0.0",
      react: "^18.0.0",
      "react-dom": "^18.0.0",
      "@supabase/supabase-js": "^2.38.0",
      "@radix-ui/react-button": "^0.1.0",
      "@radix-ui/react-card": "^0.1.0",
      "tailwindcss": "^3.4.0",
      "typescript": "^5.3.0",
      "@types/node": "^20.0.0",
      "@types/react": "^18.0.0",
      "@types/react-dom": "^18.0.0"
    },
    devDependencies: {
      eslint: "^8.0.0",
      "eslint-config-next": "^14.0.0"
    }
  };
  
  fs.writeFileSync(
    path.join(templateDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create README.md
  const readme = `# ${template.title}

${template.description}

## Features

- Modern ${template.category} application
- Built with Next.js 14 and TypeScript
- TailwindCSS for styling
- Supabase for database and authentication
- Radix UI components

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See \`.env.example\` for the required environment variables.

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Radix UI
- **Authentication**: Supabase Auth

## License

MIT
`;
  
  fs.writeFileSync(path.join(templateDir, 'README.md'), readme);
  
  // Create .env.example
  const envExample = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
`;
  
  fs.writeFileSync(path.join(templateDir, '.env.example'), envExample);
  
  // Create src directory structure
  const srcDir = path.join(templateDir, 'src');
  fs.mkdirSync(srcDir, { recursive: true });
  
  // Create src/app
  const appDir = path.join(srcDir, 'app');
  fs.mkdirSync(appDir, { recursive: true });
  
  // Create layout.tsx
  const layout = `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${template.title}',
  description: '${template.description}',
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
  
  fs.writeFileSync(path.join(appDir, 'layout.tsx'), layout);
  
  // Create page.tsx
  const page = `import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ${template.title}
          </h1>
          <p className="text-xl text-gray-600">
            ${template.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature 1</CardTitle>
              <CardDescription>
                Core functionality for ${template.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Get Started</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature 2</CardTitle>
              <CardDescription>
                Advanced capabilities and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Learn More</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature 3</CardTitle>
              <CardDescription>
                Enterprise-grade features and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
`;
  
  fs.writeFileSync(path.join(appDir, 'page.tsx'), page);
  
  // Create globals.css
  const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

* {
  border-color: hsl(var(--border));
}

body {
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}
`;
  
  fs.writeFileSync(path.join(appDir, 'globals.css'), globalsCss);
  
  // Create src/components
  const componentsDir = path.join(srcDir, 'components');
  fs.mkdirSync(componentsDir, { recursive: true });
  
  // Create ui components
  const uiDir = path.join(componentsDir, 'ui');
  fs.mkdirSync(uiDir, { recursive: true });
  
  // Button component
  const button = `import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
`;
  
  fs.writeFileSync(path.join(uiDir, 'button.tsx'), button);
  
  // Card component
  const card = `import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
`;
  
  fs.writeFileSync(path.join(uiDir, 'card.tsx'), card);
  
  // Create src/lib
  const libDir = path.join(srcDir, 'lib');
  fs.mkdirSync(libDir, { recursive: true });
  
  // utils.ts
  const utils = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
  
  fs.writeFileSync(path.join(libDir, 'utils.ts'), utils);
  
  // Create src/db
  const dbDir = path.join(srcDir, 'db');
  fs.mkdirSync(dbDir, { recursive: true });
  
  // schema.ts
  const schema = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface ${template.name.replace(/-/g, '')} {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
`;
  
  fs.writeFileSync(path.join(dbDir, 'schema.ts'), schema);
  
  console.log(`Created: ${template.number}-${template.name}`);
});

console.log('\nDone! All missing templates created.');
