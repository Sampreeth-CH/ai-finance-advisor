import React, { useMemo } from 'react'
import { TrendingUp, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const WealthSimulator = ({ transactions }) => {
  // Define keywords that represent "Junk" or "Want" spending
  const junkKeywords = [
    'swiggy',
    'zomato',
    'zepto',
    'blinkit',
    'starbucks',
    'movie',
    'zara',
    'myntra',
    'netflix',
    'amazon',
    'dining',
    'food',
    'shopping',
  ]

  const analysis = useMemo(() => {
    if (!transactions || transactions.length === 0) return null

    let totalJunkSpent = 0
    const junkItems = []

    // Filter transactions to find junk spending
    transactions.forEach((tx) => {
      // Only look at expenses (negative amounts)
      if (tx.amount < 0) {
        const descriptionLower = tx.description.toLowerCase()
        const categoryLower = (tx.category || '').toLowerCase()

        // Check if the description or category matches our junk keywords
        const isJunk = junkKeywords.some(
          (keyword) =>
            descriptionLower.includes(keyword) ||
            categoryLower.includes(keyword),
        )

        if (isJunk) {
          totalJunkSpent += Math.abs(tx.amount)
          junkItems.push(tx)
        }
      }
    })

    if (totalJunkSpent === 0) return null

    // Financial Math: Compound Interest Formula (A = P(1 + r/n)^(nt))
    // Assume 12% annual return in a Nifty 50 Index Fund over 5 years
    const principal = totalJunkSpent
    const rate = 0.12
    const years = 5
    const futureValue = principal * Math.pow(1 + rate, years)
    const potentialProfit = futureValue - principal

    return {
      spent: principal,
      futureValue: futureValue,
      profit: potentialProfit,
      count: junkItems.length,
    }
  }, [transactions])

  if (!analysis) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='glass-panel p-6 border-l-4 border-l-brand-glow relative overflow-hidden'
    >
      {/* Decorative background element */}
      <div className='absolute -right-10 -top-10 w-32 h-32 bg-brand-glow/10 rounded-full blur-3xl'></div>

      <div className='flex items-start gap-4'>
        <div className='p-3 rounded-xl bg-slate-800 border border-slate-700'>
          <TrendingUp className='text-brand-glow' size={24} />
        </div>

        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-1'>
            <h3 className='text-lg font-bold text-white'>
              The Nifty 50 Regret Simulator
            </h3>
            <AlertCircle size={16} className='text-slate-400' />
          </div>

          <p className='text-slate-300 text-sm mb-4 leading-relaxed'>
            You have spent{' '}
            <strong className='text-red-400 font-semibold'>
              ₹
              {analysis.spent.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
              })}
            </strong>{' '}
            on {analysis.count} unnecessary lifestyle expenses. If you had
            invested that exact amount into a Nifty 50 Index Fund today...
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-slate-900/50 rounded-lg p-4 border border-slate-700'>
              <p className='text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1'>
                In 5 Years it would be worth
              </p>
              <p className='text-2xl font-bold text-emerald-400'>
                ₹
                {analysis.futureValue.toLocaleString('en-IN', {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>

            <div className='bg-slate-900/50 rounded-lg p-4 border border-slate-700'>
              <p className='text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1'>
                Total Lost Profit
              </p>
              <p className='text-2xl font-bold text-brand-glow'>
                ₹
                {analysis.profit.toLocaleString('en-IN', {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WealthSimulator
