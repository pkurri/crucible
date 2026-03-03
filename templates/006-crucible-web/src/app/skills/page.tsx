'use client'

import { useState, useEffect } from 'react'
import { Search, Zap, Workflow, Code, Database, Shield, Layout, Settings } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    async function fetchSkills() {
      const { data, error } = await supabase
        .from('forge_skills')
        .select('*')
        .order('name', { ascending: true })
      
      if (!error && data) {
        setSkills(data)
      }
      setIsLoading(false)
    }
    fetchSkills()
  }, [])

  const categories = ['all', ...Array.from(new Set(skills.map(s => s.category)))]

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredSkills.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const visibleSkills = filteredSkills.slice(startIndex, startIndex + itemsPerPage)

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))

  // Basic icon mapping based on fuzzy match of category
  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('workflow')) return <Workflow className="h-5 w-5" />
    if (lower.includes('quality') || lower.includes('dev')) return <Code className="h-5 w-5" />
    if (lower.includes('cloud') || lower.includes('data')) return <Database className="h-5 w-5" />
    if (lower.includes('security')) return <Shield className="h-5 w-5" />
    if (lower.includes('front')) return <Layout className="h-5 w-5" />
    if (lower.includes('meta') || lower.includes('tool')) return <Settings className="h-5 w-5" />
    return <Zap className="h-5 w-5" />
  }

  return (
    <div className="min-h-screen pt-12 pb-24">
      <div className="max-w-[1920px] mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 border-b border-[#2a2a2a] pb-8">
          <h1 className="text-5xl md:text-7xl font-black text-[#e0e0e0] mb-4 tracking-tight uppercase">
            Core Samples
          </h1>
          <p className="font-mono text-[#00ff88] text-sm tracking-widest uppercase flex items-center gap-3">
            {isLoading ? (
              <span className="animate-pulse">Loading Core Samples...</span>
            ) : (
              <>
                <span className="w-2 h-2 bg-[#00ff88] animate-pulse rounded-full"></span>
                // {skills.length} Forged Capabilities & Agent Utilities
              </>
            )}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search internal logic arrays..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-4 rounded-none border border-[#2a2a2a] bg-[#111] text-[#e0e0e0] font-mono focus:outline-none focus:border-[#ff8c00] transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-4 py-3 font-mono text-xs tracking-wider uppercase transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-[#ff8c00] text-black border-[#ff8c00]'
                    : 'bg-[#111] text-[#e0e0e0] border-[#2a2a2a] hover:border-[#555]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pagination Controls */}
        {filteredSkills.length > itemsPerPage && (
          <div className="flex justify-end gap-2 mb-8">
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
        )}

        {/* Skills Grid */}
        {filteredSkills.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-[#2a2a2a]">
            <p className="font-mono text-gray-500 uppercase tracking-widest">
              [ NO CAPABILITIES DETECTED MATCHING QUERY ]
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleSkills.map((skill) => (
              <div
                key={skill.id + Math.random()}
                className="brick p-6 flex flex-col h-full cursor-url('/crosshair.svg'), pointer group"
              >
                <div className="flex items-start justify-between mb-4 border-b border-[#2a2a2a] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#2a2a2a] text-[#ff8c00] group-hover:text-[#00ff88] transition-colors">
                      {getCategoryIcon(skill.category)}
                    </div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-gray-400">
                      {skill.category}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                  {skill.name}
                </h3>
                
                <p className="font-mono text-sm text-gray-400 mb-6 flex-grow leading-relaxed">
                  {skill.description}
                </p>
                
                <div className="mt-auto flex justify-between items-center text-xs font-mono">
                  <span className="text-[#2a2a2a] group-hover:text-[#ff8c00] transition-colors tracking-widest">
                    ID: {(skill.skill_id || skill.id).toUpperCase()}
                  </span>
                  <span className="text-[#00ff88] animate-pulse">
                    [ READY ]
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
