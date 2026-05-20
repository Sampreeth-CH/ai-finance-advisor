import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { motion } from 'framer-motion'
import { Wallet, UserPlus } from 'lucide-react'

const SignupPage = () => {
  const [name, setName] = useState('') // Added Name state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const signup = useAppStore((state) => state.signup)
  const { loading, error } = useAppStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Now passing all three variables to the store!
    const success = await signup(email, password, name)
    if (success) {
      navigate('/login') // Usually good to redirect to login after signup
    }
  }

  return (
    <div className='min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden'>
      <div className='absolute top-1/4 right-1/4 w-96 h-96 bg-brand-glow/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen' />
      <div className='absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen' />

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
          <h2 className='text-2xl font-bold text-white'>Create Account</h2>
          <p className='text-slate-400 text-sm mt-1'>
            Join AI Finance Advisor today
          </p>
        </div>

        {error && (
          <div className='bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* ADDED FULL NAME FIELD */}
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-1'>
              Full Name
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='glass-input w-full'
              placeholder='John Doe'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-1'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='glass-input w-full'
              placeholder='you@example.com'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-1'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='glass-input w-full'
              placeholder='••••••••'
              required
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full glass-button mt-6 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg'
          >
            {loading ? (
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
            ) : (
              <>
                <UserPlus size={18} />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-400'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='text-brand-glow hover:underline text-cyan-400'
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default SignupPage
