import React, { useEffect, useState, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import api from '../services/api'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Bot,
  Briefcase,
  Angry,
  Flame,
  Send,
  Loader2,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const AdvisorPage = () => {
  const { dashboardData, fetchDashboard } = useAppStore()
  const [activePersona, setActivePersona] = useState('professional')
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content:
        'Hello! I am your AI Copilot. How can I help you analyze your finances today?',
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const ai_advisor = dashboardData?.ai_advisor

  const personas = [
    {
      id: 'professional',
      name: 'The Banker',
      icon: Briefcase,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
    },
    {
      id: 'parent',
      name: 'Strict Parent',
      icon: Angry,
      color: 'text-amber-400',
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/50',
    },
    {
      id: 'roaster',
      name: 'The Roaster',
      icon: Flame,
      color: 'text-rose-500',
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/50',
    },
  ]

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    const userMsg = chatMessage
    setChatMessage('')
    setChatHistory((prev) => [...prev, { role: 'user', content: userMsg }])
    setIsTyping(true)

    try {
      const response = await api.post('/chat', {
        message: userMsg,
        history: chatHistory.slice(-4), // Send last 4 messages for context
        persona: activePersona,
      })

      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.reply },
      ])
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Connection error. The AI is currently unavailable.',
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handlePersonaChange = (personaId) => {
    setActivePersona(personaId)
    setChatHistory([
      {
        role: 'assistant',
        content: `Persona switched to ${personas.find((p) => p.id === personaId).name}. Go ahead, ask me about your spending...`,
      },
    ])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 h-[calc(100vh-100px)] flex flex-col pb-4'
    >
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-white'>AI Copilot</h1>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0'>
        {/* LEFT SIDE: The Master Report */}
        <div className='glass-panel p-6 flex flex-col border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden'>
          <div className='absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[80px] pointer-events-none rounded-full' />

          <div className='flex items-center gap-4 mb-6 relative z-10 border-b border-slate-800 pb-4'>
            <div className='p-3 bg-cyan-500/20 rounded-xl'>
              <Bot className='text-cyan-400 w-6 h-6' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>
                Master Financial Report
              </h2>
              <p className='text-xs text-slate-400 mt-1'>
                Generated upon file upload
              </p>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto pr-4 relative z-10'>
            {ai_advisor ? (
              <div className='text-slate-300 leading-relaxed text-sm space-y-4'>
                <ReactMarkdown
                  components={{
                    strong: ({ node, ...props }) => (
                      <span className='font-bold text-cyan-400' {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className='mb-4' {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className='list-disc ml-6 mb-6 space-y-2'
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li>
                        <span className='opacity-90' {...props} />
                      </li>
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className='text-lg font-bold text-white mt-6 mb-3'
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
                <p className='text-lg font-medium text-slate-400'>
                  No AI insights generated yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Interactive Persona Chat */}
        <div className='glass-panel flex flex-col relative overflow-hidden'>
          {/* Persona Selector Header */}
          <div className='p-4 border-b border-slate-800 bg-slate-900/50'>
            <p className='text-xs text-slate-400 uppercase tracking-wider font-bold mb-3'>
              Select AI Personality
            </p>
            <div className='flex gap-2'>
              {personas.map((p) => {
                const Icon = p.icon
                const isActive = activePersona === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePersonaChange(p.id)}
                    className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl border transition-all ${
                      isActive
                        ? `${p.bg} ${p.border} ${p.color}`
                        : 'border-slate-800 text-slate-500 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon size={18} className='mb-1' />
                    <span className='text-[10px] font-bold tracking-wide'>
                      {p.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chat History */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      strong: ({ node, ...props }) => (
                        <span className='font-bold text-white' {...props} />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className='flex justify-start'>
                <div className='bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-bl-none flex gap-2'>
                  <div className='w-2 h-2 bg-slate-500 rounded-full animate-bounce'></div>
                  <div className='w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100'></div>
                  <div className='w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200'></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className='p-4 border-t border-slate-800 bg-slate-900/50'>
            <form onSubmit={handleSendMessage} className='flex gap-2'>
              <input
                type='text'
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder='Ask about your spending...'
                className='flex-1 glass-input py-3'
                disabled={isTyping}
              />
              <button
                type='submit'
                disabled={isTyping || !chatMessage.trim()}
                className='bg-brand-glow text-slate-900 p-3 rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50'
              >
                {isTyping ? (
                  <Loader2 size={20} className='animate-spin text-white' />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AdvisorPage
