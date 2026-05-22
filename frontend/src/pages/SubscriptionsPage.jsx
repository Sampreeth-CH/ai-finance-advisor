import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { motion } from 'framer-motion'
import { Repeat, AlertOctagon, Skull, CreditCard } from 'lucide-react'

const SubscriptionsPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await api.get('/subscriptions/')
        setData(res.data)
      } catch (error) {
        console.error('Failed to load subscriptions', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscriptions()
  }, [])

  if (loading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(244,63,94,0.5)]'></div>
      </div>
    )
  }

  const { subscriptions, total_monthly, yearly_drain } = data || {
    subscriptions: [],
    total_monthly: 0,
    yearly_drain: 0,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 pb-8 max-w-6xl mx-auto'
    >
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-white flex items-center gap-2'>
            <Repeat className='text-rose-500' /> Subscription Sniper
          </h1>
          <p className='text-sm text-slate-400 mt-1'>
            AI-detected recurring charges and hidden fees.
          </p>
        </div>
      </div>

      {/* The Yearly Drain Alert */}
      <div className='glass-panel p-8 border-t-4 border-t-rose-500 bg-gradient-to-br from-slate-900 to-rose-950/20 relative overflow-hidden'>
        <Skull className='absolute -right-4 -bottom-4 w-32 h-32 text-rose-500/10 pointer-events-none' />
        <div className='flex flex-col md:flex-row justify-between items-center gap-6 relative z-10'>
          <div>
            <h2 className='text-lg font-bold text-rose-400 flex items-center gap-2'>
              <AlertOctagon size={20} /> The Yearly Drain
            </h2>
            <p className='text-slate-300 mt-2 max-w-md text-sm leading-relaxed'>
              If you do not cancel any of your current recurring expenses, this
              is exactly how much money will vanish from your account over the
              next 12 months.
            </p>
          </div>
          <div className='text-center md:text-right'>
            <p className='text-sm text-slate-400 uppercase tracking-wider font-bold mb-1'>
              Total Projected Cost
            </p>
            <p className='text-4xl md:text-5xl font-black text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]'>
              ₹
              {yearly_drain.toLocaleString('en-IN', {
                maximumFractionDigits: 0,
              })}
            </p>
            <p className='text-sm text-rose-400/80 mt-2 font-medium'>
              ₹{total_monthly.toLocaleString()}/month
            </p>
          </div>
        </div>
      </div>

      {/* The Subscriptions Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {subscriptions.length === 0 ? (
          <div className='col-span-full glass-panel p-12 text-center text-slate-500 flex flex-col items-center'>
            <CreditCard size={48} className='mb-4 opacity-20' />
            <p className='text-lg'>No recurring charges detected yet.</p>
            <p className='text-sm mt-1'>
              Add more transactions so the AI can find patterns.
            </p>
          </div>
        ) : (
          subscriptions.map((sub, idx) => (
            <div
              key={idx}
              className='glass-panel p-6 hover:border-rose-500/30 transition-colors group'
            >
              <div className='flex justify-between items-start mb-4'>
                <div className='w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold text-white border border-slate-700'>
                  {sub.name.charAt(0)}
                </div>
                <div className='text-right'>
                  <span className='text-xl font-bold text-white'>
                    ₹{sub.monthly_cost.toLocaleString()}
                  </span>
                  <span className='text-xs text-slate-500 block'>/ mo</span>
                </div>
              </div>

              <h3
                className='text-lg font-bold text-slate-200 truncate'
                title={sub.name}
              >
                {sub.name}
              </h3>
              <p className='text-xs font-medium text-rose-400/80 mt-1'>
                {sub.frequency}
              </p>

              <div className='mt-6 pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs'>
                <span className='text-slate-500'>
                  Last paid: {sub.last_paid}
                </span>
                <span className='text-slate-400 font-bold'>
                  ₹{sub.yearly_cost.toLocaleString()}/yr
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}

export default SubscriptionsPage
