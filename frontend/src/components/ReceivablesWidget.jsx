import React from 'react'
// FIX: Changed ArrowRightRight to ArrowRight
import { Users, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const ReceivablesWidget = ({ receivables }) => {
  // Calculate total amount owed to the user
  const totalOwed =
    receivables?.reduce((sum, item) => sum + item.amount, 0) || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='glass-panel p-6 border-t-4 border-t-blue-500 h-full flex flex-col'
    >
      <div className='flex justify-between items-start mb-6'>
        <div>
          <h3 className='text-lg font-bold text-white flex items-center gap-2'>
            <span className='p-2 rounded-lg bg-blue-500/10 text-blue-400'>
              <Users size={18} />
            </span>
            Shared Wallets
          </h3>
          <p className='text-sm text-slate-400 mt-1'>
            Track who owes you money
          </p>
        </div>
        <div className='text-right'>
          <p className='text-xs text-slate-400 uppercase tracking-wider font-semibold'>
            Total Owed
          </p>
          <p className='text-xl font-bold text-blue-400'>
            ₹{totalOwed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto pr-2 space-y-3'>
        {!receivables || receivables.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center text-center text-slate-500 py-6'>
            <Users size={32} className='mb-2 opacity-20' />
            <p>
              You are all settled up!
              <br />
              No pending shared bills.
            </p>
          </div>
        ) : (
          receivables.map((person, idx) => (
            <div
              key={idx}
              className='flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 transition-colors'
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300'>
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <span className='text-slate-200 font-medium capitalize'>
                  {person.name}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                {/* FIX: Used ArrowRight here */}
                <ArrowRight size={14} className='text-slate-500' />
                <span className='font-bold text-emerald-400'>
                  +₹
                  {person.amount.toLocaleString('en-IN', {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}

export default ReceivablesWidget
