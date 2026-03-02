import templateData from '@/data/templates.json';

export default function Home() {
  return (
    <main className="min-h-screen pt-12 pb-24">
      <div className="max-w-[1920px] mx-auto px-6">
        <div className="mb-16 border-b border-[#2a2a2a] pb-8">
          <h1 className="text-5xl md:text-7xl font-black text-[#e0e0e0] mb-4 tracking-tight">
            THE ARMORY
          </h1>
          <p className="font-mono text-[#ff8c00] text-sm tracking-widest uppercase">
            // 100 Production-Ready Architecture Templates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templateData.map((tpl) => (
            <TemplateCard
              key={tpl.number}
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
