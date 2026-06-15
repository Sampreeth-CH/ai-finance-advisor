import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, LogIn, AlertCircle } from 'lucide-react'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  // Pull all needed states and actions from the store
  const { login, loading, error, clearError } = useAppStore()

  // Clear any existing errors when the page first loads
  useEffect(() => {
    clearError()
  }, [clearError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await login(username, password)
    if (success) {
      navigate('/dashboard')
    }
  }

  // Clear the error as soon as the user starts typing to fix their mistake
  const handleInputChange = (setter) => (e) => {
    if (error) clearError()
    setter(e.target.value)
  }

  return (
    <div className='min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden'>
      {/* Background Orbs */}
      <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-brand-glow/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen' />
      <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen' />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='glass-panel p-8 w-full max-w-md z-10'
      >
        <div className='flex flex-col items-center mb-8'>
          <div className='w-12 h-12 rounded-xl bg-brand-glow/20 flex items-center justify-center border border-brand-glow/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] mb-4'>
            <Wallet className='text-brand-glow' size={28} />
          </div>
          <h2 className='text-2xl font-bold text-white'>Welcome Back</h2>
          <p className='text-slate-400 text-sm mt-1'>
            Sign in to your AI Finance Advisor
          </p>
        </div>

        {/* Smoothly animated error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: 'auto', mb: 24 }}
              exit={{ opacity: 0, height: 0, mb: 0 }}
              className='bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3 overflow-hidden'
            >
              <AlertCircle size={18} className='shrink-0 mt-0.5' />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-1'>
              Email
            </label>
            <input
              type='text'
              value={username}
              onChange={handleInputChange(setUsername)}
              className='glass-input w-full focus:border-brand-glow/50 focus:ring-1 focus:ring-brand-glow/50 transition-all outline-none'
              placeholder='you@example.com'
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-1'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={handleInputChange(setPassword)}
              className='glass-input w-full focus:border-brand-glow/50 focus:ring-1 focus:ring-brand-glow/50 transition-all outline-none'
              placeholder='••••••••'
              required
              disabled={loading}
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full glass-button mt-6 flex justify-center items-center gap-2 disabled:opacity-70'
          >
            {loading ? (
              <div className='w-5 h-5 border-2 border-brand-glow border-t-transparent rounded-full animate-spin' />
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-400'>
          Don't have an account?{' '}
          <Link to='/signup' className='text-brand-glow hover:underline'>
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage
