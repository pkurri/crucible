'use client';

export function LoadingSpinner() {
  return (
    <div className="relative w-12 h-12">
      <div 
        className="absolute inset-0 border-t-2 border-b-2 border-r-2 border-transparent border-t-[#ff8c00] border-b-[#ff8c00]/30 border-r-[#ff8c00]/50 rounded-full animate-spin-molten"
      ></div>
      <div 
        className="absolute inset-2 border-l-2 border-[#00ff88]/30 rounded-full animate-spin-reverse"
      ></div>
      <div className="absolute inset-[15px] bg-[#ff8c00]/10 rounded-full animate-pulse"></div>
    </div>
  );
}
