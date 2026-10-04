'use client'

import {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {
  Shield,
  Bot,
  Database,
  Zap,
  Plus,
  ArrowRight,
  Activity,
  Terminal,
  CheckCircle2,
  X,
  Rocket,
  Workflow,
  Users,
} from 'lucide-react'
import {getSupabase} from '@/lib/supabase'
import {logConversionEvent} from '@/lib/analytics'

const supabase = getSupabase()

export default function Home() {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployResult, setDeployResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const itemsPerPage = 12

  useEffect(() => {
    async function fetchTemplates() {
      const {data, error} = await supabase
        .from('forge_templates')
        .select('*')
        .order('template_id', {ascending: true})

      if (!error && data) {
        setTemplates(data)
      }
      setIsLoading(false)
    }
    fetchTemplates()
  }, [])

  const totalPages = Math.ceil(templates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const visibleTemplates = templates.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  return (
    <main className='min-h-screen pt-12 pb-24'>
      <div className='max-w-[1920px] mx-auto px-6'>
        <section className='mb-12 max-w-5xl'>
          <p className='font-mono text-[#ff8c00] text-xs tracking-[0.3em] uppercase mb-4'>
            365+ Skills &middot; 63 Agents &middot; 114+ Templates
          </p>
          <h1 className='text-4xl md:text-6xl font-black text-[#e0e0e0] mb-6 tracking-tight leading-[1.05]'>
            Ship your next AI workflow before your next planning meeting
          </h1>
          <p className='text-[#999] text-lg max-w-3xl mb-8 leading-relaxed'>
            Start with a production-ready skill pack and template, then use the
            Crucible dashboard to orchestrate, deploy, and monitor the work.
          </p>
          <div className='flex flex-wrap gap-4'>
            <a
              href='/pricing'
              onClick={() => void logConversionEvent('click', {cta: 'hero_start_starter', destination: '/pricing'})}
              className='px-6 py-3 bg-gradient-to-r from-[#ff8c00] to-[#ff6600] text-black font-mono font-bold text-sm tracking-wide rounded-xl hover:brightness-110 transition-all inline-flex items-center gap-2'
            >
              Start with Starter — $49/mo <ArrowRight className='w-4 h-4' />
            </a>
            <a
              href='#armory'
              onClick={() => void logConversionEvent('click', {cta: 'hero_browse_armory', destination: '#armory'})}
              className='px-6 py-3 bg-[#111] border border-[#333] text-white font-mono text-sm tracking-wide rounded-xl hover:bg-[#1a1a1a] transition-colors inline-flex items-center gap-2'
            >
              Explore workflows
            </a>
          </div>
        </section>

        <section className='grid gap-4 md:grid-cols-3 mb-16'>
          <div className='rounded-xl border border-[#2a2a2a] bg-[#0a0a0c] p-6'>
            <Rocket className='w-5 h-5 text-[#ff8c00] mb-4' />
            <h2 className='text-white font-bold mb-2'>1. Choose a workflow</h2>
            <p className='text-sm text-[#888] leading-relaxed'>Start from a template built around the job you need to ship.</p>
          </div>
          <div className='rounded-xl border border-[#2a2a2a] bg-[#0a0a0c] p-6'>
            <Workflow className='w-5 h-5 text-[#00ff88] mb-4' />
            <h2 className='text-white font-bold mb-2'>2. Run it with your stack</h2>
            <p className='text-sm text-[#888] leading-relaxed'>Install skill commands locally or orchestrate agents from the dashboard.</p>
          </div>
          <div className='rounded-xl border border-[#2a2a2a] bg-[#0a0a0c] p-6'>
            <Users className='w-5 h-5 text-fuchsia-400 mb-4' />
            <h2 className='text-white font-bold mb-2'>3. Expand when the team does</h2>
            <p className='text-sm text-[#888] leading-relaxed'>Move to team orchestration, dedicated support, and custom infrastructure when needed.</p>
          </div>
        </section>

        <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mb-16'>
          <div className='rounded-2xl border border-[#ff8c00]/30 bg-[#ff8c00]/5 p-8'>
            <p className='font-mono text-xs uppercase tracking-[0.25em] text-[#ff8c00] mb-3'>Free activation workflow</p>
            <h2 className='text-3xl font-black text-white mb-3'>Start with AI Code Reviewer</h2>
            <p className='text-[#aaa] max-w-xl leading-relaxed mb-6'>Bring a pull request and your review criteria. The workflow gives you a structured starting point for AI-assisted review and exposes the next setup decisions inside the Hub.</p>
            <a
              href='/login?next=%2Fhub%3Fstarter%3DAi%2520Code%2520Reviewer'
              onClick={() => void logConversionEvent('click', {cta: 'free_starter_ai_code_reviewer', destination: '/hub'})}
              className='inline-flex items-center gap-2 rounded-xl bg-[#ff8c00] px-5 py-3 font-mono text-sm font-bold text-black transition hover:brightness-110'
            >
              Open free starter workflow <ArrowRight className='w-4 h-4' />
            </a>
          </div>
          <div className='rounded-2xl border border-[#2a2a2a] bg-[#0a0a0c] p-8'>
            <p className='font-mono text-xs uppercase tracking-[0.25em] text-fuchsia-400 mb-3'>Need implementation help?</p>
            <h2 className='text-3xl font-black text-white mb-3'>Implementation sprint</h2>
            <p className='text-[#aaa] leading-relaxed mb-6'>Scope a workflow, select the right template, and leave with a practical delivery plan for your team.</p>
            <a
              href='mailto:sales@crucible.dev?subject=Implementation%20Sprint%20Inquiry&body=Team%20size%3A%0AWorkflow%20to%20implement%3A%0ACurrent%20stack%3A%0ATimeline%3A'
              onClick={() => void logConversionEvent('click', {cta: 'implementation_sprint_inquiry', destination: 'mailto:sales@crucible.dev'})}
              className='inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/50 px-5 py-3 font-mono text-sm font-bold text-fuchsia-300 transition hover:bg-fuchsia-400 hover:text-black'
            >
              Request sprint scope <ArrowRight className='w-4 h-4' />
            </a>
          </div>
        </section>

        <section className='mb-16'>
          <p className='font-mono text-xs uppercase tracking-[0.25em] text-[#ff8c00] mb-3'>What you can start from</p>
          <div className='grid gap-4 md:grid-cols-3'>
            <article className='rounded-xl border border-[#2a2a2a] bg-[#0a0a0c] p-6'>
              <h2 className='font-bold text-white mb-2'>AI Code Reviewer</h2>
              <p className='text-sm text-[#999]'>Input: pull request and review criteria. Output: a structured review workflow with suggested checks.</p>
            </article>
            <article className='rounded-xl border border-[#2a2a2a] bg-[#0a0a0c] p-6'>
              <h2 className='font-bold text-white mb-2'>CI/CD Orchestrator</h2>
              <p className='text-sm text-[#999]'>Input: delivery requirements and deployment targets. Output: a starting blueprint for pipeline automation.</p>
            </article>
            <article className='rounded-xl border border-[#2a2a2a] bg-[#0a0a0c] p-6'>
              <h2 className='font-bold text-white mb-2'>AI Content Generator</h2>
              <p className='text-sm text-[#999]'>Input: audience, subject, and channel. Output: a workflow foundation for multi-format content production.</p>
            </article>
          </div>
        </section>

        <div
          id='armory'
          className='mb-12 border-b border-[#2a2a2a] pb-8 flex flex-col md:flex-row justify-between items-end gap-6'
        >
          <div>
            <h2 className='text-5xl md:text-7xl font-black text-[#e0e0e0] mb-4 tracking-tight'>
              THE ARMORY
            </h2>
            <p className='font-mono text-[#ff8c00] text-sm tracking-widest uppercase flex items-center gap-3'>
              <span className='w-2 h-2 bg-[#ff8c00] animate-pulse rounded-full'></span>
              {templates.length} Autonomous Architecture Templates
            </p>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              aria-label='Previous page'
              className='px-4 py-2 bg-[#111] hover:bg-[#222] disabled:opacity-50 text-white font-mono text-sm border border-[#333] transition-colors'
            >
              &lt; PREV
            </button>
            <div className='px-4 py-2 font-mono text-[#aaa] text-sm border border-[#2a2a2a] bg-[#050505]'>
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              aria-label='Next page'
              className='px-4 py-2 bg-[#111] hover:bg-[#222] disabled:opacity-50 text-white font-mono text-sm border border-[#333] transition-colors'
            >
              NEXT &gt;
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {visibleTemplates.map(tpl => (
            <TemplateCard
              key={tpl.id || tpl.template_id}
              template={tpl}
              onClick={() => setSelectedTemplate(tpl)}
            />
          ))}
        </div>
      </div>

      {/* Slide-out Detail Panel */}
      <AnimatePresence>
        {selectedTemplate && (
          <>
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              onClick={() => setSelectedTemplate(null)}
              className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50'
            />
            <motion.div
              initial={{x: '100%'}}
              animate={{x: 0}}
              exit={{x: '100%'}}
              transition={{type: 'spring', damping: 25, stiffness: 200}}
              role='dialog'
              aria-modal='true'
              aria-labelledby='detail-panel-title'
              className='fixed top-0 right-0 h-full w-full md:w-[600px] bg-[#0a0a0c] border-l border-[#222] z-50 overflow-y-auto shadow-2xl'
            >
              <div className='p-8'>
                <button
                  onClick={() => {
                    setSelectedTemplate(null)
                    setDeployResult(null)
                  }}
                  aria-label='Close detail panel'
                  className='absolute top-6 right-6 text-[#999] hover:text-white transition-colors'
                >
                  <X className='w-6 h-6' aria-hidden='true' />
                </button>

                {deployResult && (
                  <div
                    className={`mb-6 p-4 rounded-lg font-mono text-xs border ${deployResult.success ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]' : 'bg-[#ff3333]/10 border-[#ff3333]/30 text-[#ff3333]'}`}
                  >
                    {deployResult.success ? (
                      <div className='flex items-center gap-2'>
                        <CheckCircle2 className='w-4 h-4' />{' '}
                        {deployResult.message}
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <X className='w-4 h-4' /> {deployResult.message}
                      </div>
                    )}
                  </div>
                )}

                <div className='mb-8'>
                  <div className='flex items-center gap-3 mb-4'>
                    <span className='font-mono text-[#ff8c00] text-sm tracking-wider px-2 py-1 bg-[#ff8c00]/10 border border-[#ff8c00]/20 rounded'>
                      TPL-{selectedTemplate.template_id}
                    </span>
                    <span className='text-xs font-mono tracking-widest px-2 py-1 bg-[#222] text-[#aaa] rounded'>
                      {selectedTemplate.category.toUpperCase()}
                    </span>
                  </div>
                  <h2
                    id='detail-panel-title'
                    className='text-4xl font-black text-white mb-4 leading-tight'
                  >
                    {selectedTemplate.name}
                  </h2>
                  <p className='text-[#ccc] font-mono text-sm leading-relaxed'>
                    {selectedTemplate.description}
                  </p>
                </div>

                <div className='grid grid-cols-2 gap-4 mb-8'>
                  <div className='bg-[#111] border border-[#222] p-4 rounded-xl'>
                    <span className='text-[#888] font-mono text-[10px] uppercase block mb-1'>
                      Complexity
                    </span>
                    <span className='text-white font-mono font-bold text-sm tracking-wide'>
                      {selectedTemplate.complexity}
                    </span>
                  </div>
                  <div className='bg-[#111] border border-[#222] p-4 rounded-xl'>
                    <span className='text-[#888] font-mono text-[10px] uppercase block mb-1'>
                      TimeToDeploy
                    </span>
                    <span className='text-white font-mono font-bold text-sm tracking-wide'>
                      {selectedTemplate.estimated_setup}
                    </span>
                  </div>
                </div>

                <div className='mb-8'>
                  <h3 className='flex items-center gap-2 font-mono text-[11px] text-[#ff8c00] tracking-[0.2em] uppercase mb-4'>
                    <Bot className='w-4 h-4' /> Included Agents
                  </h3>
                  <div className='space-y-3'>
                    {selectedTemplate.included_agents?.map(
                      (agent: any, idx: number) => (
                        <div
                          key={idx}
                          className='flex items-center justify-between p-4 bg-[#111] border border-[#222] rounded-lg'
                        >
                          <div className='flex items-center gap-3'>
                            <Terminal className='w-4 h-4 text-[#888]' />
                            <span className='text-sm font-bold text-white'>
                              {agent.name}
                            </span>
                          </div>
                          <span className='font-mono text-[10px] text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded'>
                            {agent.type}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className='mb-8'>
                  <h3 className='flex items-center gap-2 font-mono text-[11px] text-[#ff8c00] tracking-[0.2em] uppercase mb-4'>
                    <Zap className='w-4 h-4' /> Core Capabilities
                  </h3>
                  <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {selectedTemplate.capabilities?.map(
                      (cap: string, idx: number) => (
                        <li
                          key={idx}
                          className='flex items-start gap-2 text-sm text-[#aaa] font-mono'
                        >
                          <CheckCircle2 className='w-4 h-4 text-[#00ff88] shrink-0 mt-0.5' />
                          {cap}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className='pt-8 border-t border-[#222]'>
                  <button
                    onClick={async () => {
                      if (selectedTemplate.template_id > 50) {
                        void logConversionEvent('click', {cta: 'template_upgrade', templateId: selectedTemplate.template_id})
                        window.location.href = '/pricing'
                        return
                      }
                      setIsDeploying(true)
                      setDeployResult(null)
                      try {
                        const res = await fetch('/api/forge/blueprints', {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({
                            templateId: selectedTemplate.template_id,
                            name: selectedTemplate.name,
                            spec: selectedTemplate,
                          }),
                        })
                        const data = await res.json()
                        if (data.success) {
                          setDeployResult({
                            success: true,
                            message: 'Blueprint queued. Check Foundry Core.',
                          })
                        } else {
                          setDeployResult({
                            success: false,
                            message: data.error || 'Deployment failed.',
                          })
                        }
                      } catch (e: any) {
                        setDeployResult({
                          success: false,
                          message: 'Failed to connect to Forge API.',
                        })
                      } finally {
                        setIsDeploying(false)
                      }
                    }}
                    disabled={isDeploying || deployResult?.success}
                    className={`w-full py-4 ${selectedTemplate.template_id > 50 ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600' : 'bg-gradient-to-r from-[#ff8c00] to-[#ff6600]'} hover:brightness-110 text-black font-mono font-bold text-sm tracking-wide flex items-center justify-center gap-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,140,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isDeploying ? (
                      <>
                        INITIATING FORGE SEQUENCE{' '}
                        <Activity className='w-4 h-4 animate-spin' />
                      </>
                    ) : deployResult?.success ? (
                      <>
                        BLUEPRINT DEPLOYED <CheckCircle2 className='w-4 h-4' />
                      </>
                    ) : selectedTemplate.template_id > 50 ? (
                      <>
                        UPGRADE TO CRUCIBLE PRO <Shield className='w-4 h-4' />
                      </>
                    ) : (
                      <>
                        DEPLOY TO FORGE <ArrowRight className='w-4 h-4' />
                      </>
                    )}
                  </button>
                  <p className='text-center text-[#888] font-mono text-[10px] mt-4'>
                    Initiates autonomous provisioning sequence in Foundry Core.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}

function TemplateCard({
  template,
  onClick,
}: {
  template: any
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      role='button'
      tabIndex={0}
      aria-label={`View details for ${template.name}`}
      className='group bg-[#0a0a0c] border border-[#1a1a1a] hover:border-[#ff8c00]/30 p-6 flex flex-col h-full cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(255,140,0,0.05)] rounded-xl relative overflow-hidden focus-visible:ring-2 focus-visible:ring-[#ff8c00] outline-none'
    >
      <div
        aria-hidden='true'
        className='absolute inset-0 bg-gradient-to-br from-[#ff8c00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
      />

      <div className='flex justify-between items-start mb-6 relative z-10'>
        <div className='flex flex-col gap-1'>
          <span
            className={`font-mono ${template.template_id > 50 ? 'text-fuchsia-500' : 'text-[#ff8c00]'} font-bold text-sm tracking-wider`}
          >
            TPL-{template.template_id}
          </span>
          {template.agent_id && (
            <span className='font-mono text-[9px] text-[#888] flex items-center gap-1 uppercase tracking-tighter'>
              <Bot className='w-2.5 h-2.5' /> Forged by {template.agent_id}
            </span>
          )}
        </div>
        <div className='flex flex-col items-end gap-2'>
          <span className='text-[9px] font-mono top-right tracking-widest px-2 py-1 bg-[#111] text-[#aaa] border border-[#222] rounded group-hover:bg-[#ff8c00]/10 group-hover:text-[#ff8c00] group-hover:border-[#ff8c00]/20 transition-colors'>
            {template.category.toUpperCase()}
          </span>
          {template.template_id > 50 && (
            <div className='flex items-center gap-1.5 px-2 py-0.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full'>
              <Shield className='w-3 h-3 text-fuchsia-500' />
              <span className='text-[8px] font-bold text-fuchsia-500 tracking-tighter uppercase'>
                Pro
              </span>
            </div>
          )}
        </div>
      </div>
      <h3 className='text-xl font-bold mb-3 text-white leading-tight group-hover:text-[#ff8c00] transition-colors relative z-10'>
        {template.name}
      </h3>
      <p className='text-[#999] font-mono text-xs leading-relaxed mb-6 flex-grow relative z-10 line-clamp-3'>
        {template.description}
      </p>

      <div className='mt-auto pt-4 border-t border-[#1a1a1a] group-hover:border-[#ff8c00]/20 flex justify-between items-center transition-colors relative z-10'>
        <div className='flex gap-1.5'>
          <div className='w-1.5 h-4 bg-[#333] group-hover:bg-[#ff8c00] transition-colors duration-300 delay-0'></div>
          <div className='w-1.5 h-4 bg-[#333] group-hover:bg-[#ff8c00] transition-colors duration-300 delay-75'></div>
          <div className='w-1.5 h-4 bg-[#333] group-hover:bg-[#ff8c00] transition-colors duration-300 delay-150'></div>
        </div>
        <span className='text-[10px] font-mono font-bold text-[#888] group-hover:text-[#ff8c00] transition-colors uppercase tracking-[0.2em] flex items-center gap-2'>
          View Definition{' '}
          <ArrowRight className='w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300' />
        </span>
      </div>
    </div>
  )
}
