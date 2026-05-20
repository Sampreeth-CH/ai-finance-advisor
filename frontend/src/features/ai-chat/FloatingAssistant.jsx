import React, { useState, useRef, useEffect } from 'react'
import api from '../../services/api'
import { MessageSquare, X, Send, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi there! I am your AI Finance Advisor. How can I help you today?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    const currentMessages = [...messages, userMessage]
    setMessages(currentMessages)
    setInput('')
    setIsLoading(true)

    try {
      const recentHistory = currentMessages
        .slice(-4)
        .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
        .join('\n')
      const smartPrompt = `Context of our conversation:\n${recentHistory}\n\nPlease reply to the User's last message. Format any currency in Indian Rupees (₹).`

      const response = await api.post('/manual/', [
        {
          Description: smartPrompt,
          Amount: 0.0,
        },
      ])

      const assistantMessage = {
        role: 'assistant',
        content: response.data.insights || "I've processed your request.",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, I encountered an error communicating with the AI. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className='absolute bottom-16 right-0 w-[350px] md:w-96 h-[500px] glass-panel flex flex-col overflow-hidden mb-4 shadow-2xl shadow-cyan-500/10'
          >
            <div className='p-4 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <Bot className='text-brand-glow w-5 h-5' />
                <h3 className='font-semibold text-slate-100'>AI Advisor</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='text-slate-400 hover:text-white transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-slate-950/40'>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] rounded-xl p-3 ${msg.role === 'user' ? 'bg-brand-glow/20 text-slate-100 self-end rounded-tr-none border border-brand-glow/30' : 'bg-slate-800/80 text-slate-200 self-start rounded-tl-none border border-slate-700/50 shadow-md'}`}
                >
                  {/* CRITICAL FIX: Wrapped ReactMarkdown in a div to hold the className */}
                  <div className='text-sm leading-relaxed'>
                    <ReactMarkdown
                      components={{
                        strong: ({ node, ...props }) => (
                          <span
                            className='font-bold text-cyan-400'
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p className='mb-2 last:mb-0' {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className='list-disc ml-4 mb-2' {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className='mb-1' {...props} />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className='bg-slate-800/80 text-slate-200 self-start rounded-xl rounded-tl-none border border-slate-700/50 p-4 shadow-md'>
                  <div className='flex gap-1.5'>
                    <span className='w-2 h-2 bg-brand-glow rounded-full animate-bounce'></span>
                    <span
                      className='w-2 h-2 bg-brand-glow rounded-full animate-bounce'
                      style={{ animationDelay: '0.15s' }}
                    ></span>
                    <span
                      className='w-2 h-2 bg-brand-glow rounded-full animate-bounce'
                      style={{ animationDelay: '0.3s' }}
                    ></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className='p-3 border-t border-slate-800/60 bg-slate-900/80 backdrop-blur-md flex gap-2'>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder='Ask about your finances...'
                className='glass-input flex-1 text-sm py-2 px-3'
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className='p-2 bg-brand-glow/20 text-brand-glow rounded-lg hover:bg-brand-glow/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <Send className='w-4 h-4' />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-14 h-14 rounded-full bg-slate-900 border border-brand-glow/50 shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center justify-center text-brand-glow hover:scale-105 transition-transform hover:shadow-[0_0_25px_rgba(0,240,255,0.4)]'
      >
        {isOpen ? (
          <X className='w-6 h-6' />
        ) : (
          <MessageSquare className='w-6 h-6' />
        )}
      </button>
    </div>
  )
}

export default FloatingAssistant
