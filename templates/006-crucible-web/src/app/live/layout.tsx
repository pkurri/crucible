import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  variable: '--font-sans' 
});

const ibmPlexMono = IBM_Plex_Mono({ 
  weight: ['400', '500'], 
  subsets: ['latin'], 
  variable: '--font-mono' 
});

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} font-sans min-h-screen bg-[#000000] text-[#e0e0e0]`}>
      {children}
    </div>
  );
}
