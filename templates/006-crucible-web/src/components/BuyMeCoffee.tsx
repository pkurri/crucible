import Link from 'next/link';
import { Coffee, Heart, ExternalLink } from 'lucide-react';

export function BuyMeCoffee() {
  // Replace with your actual BuyMeACoffee or Ko-fi username
  const bmacUsername = "crucible"; 
  
  return (
    <div className="relative group">
      <Link 
        href={`https://www.buymeacoffee.com/${bmacUsername}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-6 py-4 bg-[#FFDD00] text-black font-bold rounded-2xl transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-1 shadow-xl shadow-yellow-500/20"
      >
        <div className="bg-black/10 p-2 rounded-lg">
          <Coffee size={24} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] uppercase tracking-tighter opacity-70">Support the Forge</span>
          <span className="text-lg font-black">Buy me a coffee</span>
        </div>
        <ExternalLink size={14} className="ml-2 opacity-50" />
      </Link>
      
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-yellow-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
    </div>
  );
}
