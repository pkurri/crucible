"use client";

import { useState } from 'react';
import templateData from '@/data/templates.json';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const totalPages = Math.ceil(templateData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTemplates = templateData.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <main className="min-h-screen pt-12 pb-24">
      <div className="max-w-[1920px] mx-auto px-6">
        <div className="mb-12 border-b border-[#2a2a2a] pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-[#e0e0e0] mb-4 tracking-tight">
              THE ARMORY
            </h1>
            <p className="font-mono text-[#ff8c00] text-sm tracking-widest uppercase flex items-center gap-3">
              <span className="w-2 h-2 bg-[#ff8c00] animate-pulse rounded-full"></span>
              {templateData.length} Autonomous Architecture Templates
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={prevPage} 
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#111] hover:bg-[#222] disabled:opacity-50 text-white font-mono text-sm border border-[#333] transition-colors"
            >
              &lt; PREV
            </button>
            <div className="px-4 py-2 font-mono text-[#888] text-sm border border-[#2a2a2a] bg-[#050505]">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#111] hover:bg-[#222] disabled:opacity-50 text-white font-mono text-sm border border-[#333] transition-colors"
            >
              NEXT &gt;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleTemplates.map((tpl) => (
            <TemplateCard
              key={tpl.number + tpl.name}
              number={tpl.number}
              name={tpl.name}
              category={tpl.category}
              description={tpl.description}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function TemplateCard({
  number,
  name,
  category,
  description,
}: {
  number: string;
  name: string;
  category: string;
  description: string;
}) {
  return (
    <div className="brick p-6 flex flex-col h-full cursor-url('/crosshair.svg'), pointer">
      <div className="flex justify-between items-start mb-6">
        <span className="font-mono text-[#ff8c00] text-sm tracking-wider">
          TPL-{number}
        </span>
        <span className="text-[10px] font-mono top-right tracking-widest px-2 py-1 border border-[#2a2a2a] rounded">
          {category.toUpperCase()}
        </span>
      </div>
      <h3 className="text-2xl font-bold mb-3 text-white leading-tight">
        {name}
      </h3>
      <p className="text-gray-400 font-mono text-sm leading-relaxed mb-6 flex-grow">
        {description}
      </p>
      
      <div className="mt-auto pt-4 border-t border-[#2a2a2a] flex justify-between items-center">
        <div className="flex gap-1">
          <div className="w-1.5 h-4 bg-[#ff8c00]"></div>
          <div className="w-1.5 h-4 bg-[#ff8c00]"></div>
          <div className="w-1.5 h-4 bg-[#ff8c00] opacity-50"></div>
          <div className="w-1.5 h-4 bg-[#ff8c00] opacity-20"></div>
        </div>
        <span className="text-xs font-mono text-[#e0e0e0] group-hover:text-[#ff8c00] transition-colors">
          [ DEPLOY ]
        </span>
      </div>
    </div>
  );
}
