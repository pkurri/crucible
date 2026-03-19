import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YouTube Industry Empire | Crucible',
  description: 'Autonomous multi-agent YouTube management system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="body">
        {children}
      </body>
    </html>
  );
}
