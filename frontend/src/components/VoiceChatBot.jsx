import React, { useState, useEffect, useRef } from 'react'
import api from '../services/api'
// NEW: Added Volume2 and VolumeX icons for the mute button
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const VoiceChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi! I am your AI Finance Advisor. Ask me anything about your spending, or tap the mic to speak!',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  // NEW: State to track if the AI voice is muted
  const [isMuted, setIsMuted] = useState(false)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Setup Web Speech API (Speech-to-Text)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-IN'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  // --- NEW: Text-to-Speech Function (The AI Talks Back) ---
  const speakText = (text) => {
    if (isMuted) return // Don't speak if muted

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Stop any currently playing audio

      const utterance = new SpeechSynthesisUtterance(text)

      // Attempt to find an Indian English or Hindi voice on the user's device
      const voices = window.speechSynthesis.getVoices()
      const indianVoice = voices.find(
        (v) => v.lang.includes('en-IN') || v.lang.includes('hi-IN'),
      )
      if (indianVoice) utterance.voice = indianVoice

      // Tune the voice to sound a bit more natural
      utterance.rate = 1.0
      utterance.pitch = 1.0

      window.speechSynthesis.speak(utterance)
    }
  }

  const sendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim()) return

    const userMsg = input
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      const response = await api.post('/chat', {
        message: userMsg,
        history: messages.slice(-5),
      })

      const replyText = response.data.reply
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: replyText },
      ])

      // --- NEW: Trigger the voice to speak the reply ---
      speakText(replyText)
    } catch (error) {
      console.error('Chat error:', error)
      const errorText = 'Oops! I am having trouble connecting to the server.'
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorText },
      ])
      speakText(errorText) // Speak the error too
    } finally {
      setIsLoading(false)
    }
  }

  // Stop talking if the user closes the chat window
  const handleCloseChat = () => {
    setIsOpen(false)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-brand-glow text-white shadow-lg hover:scale-105 transition-transform z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className='fixed bottom-6 right-6 w-96 h-[500px] glass-panel flex flex-col shadow-2xl z-50 overflow-hidden border border-slate-700/50'
          >
            {/* Header */}
            <div className='p-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
                <h3 className='font-semibold text-white'>AI Advisor</h3>
              </div>

              <div className='flex items-center gap-3'>
                {/* --- NEW: Mute/Unmute Toggle --- */}
                <button
                  onClick={() => {
                    setIsMuted(!isMuted)
                    if (!isMuted && 'speechSynthesis' in window)
                      window.speechSynthesis.cancel()
                  }}
                  className='text-slate-400 hover:text-brand-glow transition-colors'
                  title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                <button
                  onClick={handleCloseChat}
                  className='text-slate-400 hover:text-red-400 transition-colors'
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/40'>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className='flex justify-start'>
                  <div className='bg-slate-800 p-3 rounded-2xl rounded-tl-sm border border-slate-700'>
                    <Loader2
                      size={16}
                      className='text-brand-glow animate-spin'
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={sendMessage}
              className='p-4 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2'
            >
              <button
                type='button'
                onClick={toggleListen}
                className={`p-2 rounded-full transition-colors ${
                  isListening
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title='Voice Input'
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening ? 'Listening...' : 'Ask about your finances...'
                }
                className='flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-glow'
              />

              <button
                type='submit'
                disabled={!input.trim() || isLoading}
                className='p-2 rounded-full bg-brand-glow/20 text-brand-glow hover:bg-brand-glow hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default VoiceChatBot
