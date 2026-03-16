import './globals.css';
import { Outfit, JetBrains_Mono, VT323 } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import { AuthErrorListener } from '@/components/auth/AuthErrorListener';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
});

export const metadata = {
  title: 'Crucible | The Industrial AI Forge',
  description: 'Production-grade AI skill packs. Forge high-performance, resilient, and multi-agent systems with industrial precision.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} ${vt323.variable}`}>
      <body className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans antialiased overflow-x-hidden">
        <AuthErrorListener />
        <AppShell>{children}</AppShell>
        {/* Analytics only loads in production to avoid local dev errors */}
        {process.env.NODE_ENV === 'production' && (
          <script async src="/_vercel/insights/script.js" />
        )}
      </body>
    </html>
  );
}
