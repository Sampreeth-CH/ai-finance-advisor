import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { motion } from 'framer-motion'
import { Sparkles, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const AdvisorPage = () => {
  const { dashboardData, fetchDashboard } = useAppStore()

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const ai_advisor = dashboardData?.ai_advisor

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 h-full flex flex-col pb-8'
    >
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-white'>AI Copilot</h1>
      </div>

      <div className='glass-panel p-6 md:p-10 flex flex-col border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden flex-1'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] pointer-events-none rounded-full' />

        <div className='flex items-center gap-4 mb-8 relative z-10 border-b border-slate-800 pb-6'>
          <div className='p-4 bg-cyan-500/20 rounded-2xl'>
            <Bot className='text-cyan-400 w-8 h-8' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-white'>
              Financial Deep Dive
            </h2>
            <p className='text-slate-400 mt-1'>Powered by LLaMA 3.3</p>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto pr-4 relative z-10'>
          {ai_advisor ? (
            <div className='text-slate-300 leading-relaxed text-base md:text-lg space-y-4'>
              <ReactMarkdown
                components={{
                  strong: ({ node, ...props }) => (
                    <span className='font-bold text-cyan-400' {...props} />
                  ),
                  p: ({ node, ...props }) => <p className='mb-4' {...props} />,
                  ul: ({ node, ...props }) => (
                    <ul className='list-disc ml-6 mb-6 space-y-2' {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li>
                      <span className='opacity-90' {...props} />
                    </li>
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className='text-xl font-bold text-white mt-8 mb-4'
                      {...props}
                    />
                  ),
                }}
              >
                {String(ai_advisor)}
              </ReactMarkdown>
            </div>
          ) : (
            <div className='h-full flex flex-col items-center justify-center text-center text-slate-500'>
              <Sparkles size={48} className='mb-4 opacity-20' />
              <p className='text-xl font-medium text-slate-400'>
                No AI insights generated yet.
              </p>
              <p className='text-sm mt-2'>
                Add more transactions to get a personalized breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default AdvisorPage
