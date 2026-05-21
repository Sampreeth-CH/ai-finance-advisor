import React from 'react'
import { Activity, Award, AlertTriangle, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

const FinScoreCard = ({ score = 650 }) => {
  // Determine color and status based on the score
  let status = 'Fair'
  let colorClass = 'text-yellow-400'
  let bgClass = 'bg-yellow-400/10'
  let strokeColor = '#facc15' // Tailwind yellow-400
  let Icon = Activity
  let message = "You're doing okay, but there's room to grow your savings."

  if (score >= 750) {
    status = 'Excellent'
    colorClass = 'text-emerald-400'
    bgClass = 'bg-emerald-400/10'
    strokeColor = '#34d399' // Tailwind emerald-400
    Icon = Award
    message = 'Financial Ninja! Your saving habits are top tier.'
  } else if (score >= 600) {
    status = 'Good'
    colorClass = 'text-cyan-400'
    bgClass = 'bg-cyan-400/10'
    strokeColor = '#22d3ee' // Tailwind cyan-400
    Icon = TrendingUp
    message = 'On the right track! Cut back on a few impulse buys to level up.'
  } else if (score < 500) {
    status = 'Needs Work'
    colorClass = 'text-rose-500'
    bgClass = 'bg-rose-500/10'
    strokeColor = '#f43f5e' // Tailwind rose-500
    Icon = AlertTriangle
    message =
      'Warning: High burn rate. The AI suggests an immediate budget review.'
  }

  // SVG Gauge Math
  const radius = 60
  const circumference = 2 * Math.PI * radius
  // Map score (300-850) to percentage (0-100)
  const percent = Math.max(
    0,
    Math.min(100, ((score - 300) / (850 - 300)) * 100),
  )
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-panel p-6 border-t-4 ${colorClass.replace('text-', 'border-')}`}
    >
      <div className='flex justify-between items-start mb-6'>
        <div>
          <h3 className='text-lg font-bold text-white flex items-center gap-2'>
            <span className={`p-2 rounded-lg ${bgClass} ${colorClass}`}>
              <Icon size={18} />
            </span>
            Health Score
          </h3>
          <p className='text-sm text-slate-400 mt-1'>
            AI-calculated financial health
          </p>
        </div>
      </div>

      <div className='flex flex-col md:flex-row items-center gap-8'>
        {/* The Circular Gauge */}
        <div className='relative flex items-center justify-center'>
          <svg className='transform -rotate-90 w-40 h-40'>
            {/* Background Circle */}
            <circle
              cx='80'
              cy='80'
              r={radius}
              stroke='currentColor'
              strokeWidth='12'
              fill='transparent'
              className='text-slate-800'
            />
            {/* Animated Progress Circle */}
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              cx='80'
              cy='80'
              r={radius}
              stroke={strokeColor}
              strokeWidth='12'
              fill='transparent'
              strokeDasharray={circumference}
              strokeLinecap='round'
              className='drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]'
            />
          </svg>
          <div className='absolute flex flex-col items-center justify-center text-center'>
            <span className={`text-4xl font-black ${colorClass}`}>{score}</span>
            <span className='text-xs text-slate-400 uppercase tracking-widest mt-1'>
              {status}
            </span>
          </div>
        </div>

        {/* The Message */}
        <div className='flex-1 text-center md:text-left'>
          <p className='text-slate-300 text-lg leading-relaxed'>{message}</p>
          <div className='mt-4 inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800'>
            <span>Score Range: 300 - 850</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FinScoreCard
