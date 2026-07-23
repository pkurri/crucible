import './globals.css'
import {Outfit, JetBrains_Mono, VT323} from 'next/font/google'
import {AppShell} from '@/components/AppShell'
import {AuthErrorListener} from '@/components/auth/AuthErrorListener'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://forge-agents.space'
const title = '365+ AI Skill Packs & Agent Orchestration | Crucible'
const description =
  '365+ production-grade AI skills, 63 agents, and 114+ project templates as Claude Code slash commands. Orchestrate, deploy, and monitor from one dashboard.'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    'Claude Code skills',
    'AI agent orchestration',
    'Claude Code slash commands',
    'AI skill pack',
    'autonomous agents',
    'agent templates',
  ],
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: 'Crucible',
    images: [{url: '/pixel-office-map.png', width: 1200, height: 630}],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/pixel-office-map.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang='en'
      className={`${outfit.variable} ${jetbrainsMono.variable} ${vt323.variable}`}
    >
      <body className='min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans antialiased overflow-x-hidden'>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Crucible',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Any',
              description,
              url: siteUrl,
            }),
          }}
        />
        <AuthErrorListener />
        <AppShell>{children}</AppShell>
        {/* Analytics only loads in production to avoid local dev errors */}
        {process.env.NODE_ENV === 'production' && (
          <script async src='/_vercel/insights/script.js' />
        )}
      </body>
    </html>
  )
}
