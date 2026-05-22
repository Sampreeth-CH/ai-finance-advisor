import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { motion } from 'framer-motion'
import { CalendarClock, AlertCircle, DownloadCloud } from 'lucide-react'

const UpcomingBillsPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await api.get('/upcoming-bills/')
        setData(res.data)
      } catch (error) {
        console.error('Failed to load upcoming bills', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUpcoming()
  }, [])

  if (loading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  const { upcoming, total_due } = data || { upcoming: [], total_due: 0 }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 pb-8 max-w-5xl mx-auto'
    >
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-white flex items-center gap-2'>
            <CalendarClock className='text-amber-500' /> Upcoming Bills
            Predictor
          </h1>
          <p className='text-sm text-slate-400 mt-1'>
            AI-forecasted liabilities for the next 30 days.
          </p>
        </div>
      </div>

      <div className='glass-panel p-8 border-t-4 border-t-amber-500 bg-gradient-to-br from-slate-900 to-amber-950/20'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
          <div>
            <h2 className='text-lg font-bold text-amber-400 flex items-center gap-2'>
              <AlertCircle size={20} /> 30-Day Liability Forecast
            </h2>
            <p className='text-slate-300 mt-2 max-w-md text-sm leading-relaxed'>
              Based on your historical recurring transactions, the AI predicts
              you need to keep this much liquid cash available to avoid missing
              payments.
            </p>
          </div>
          <div className='text-center md:text-right'>
            <p className='text-sm text-slate-400 uppercase tracking-wider font-bold mb-1'>
              Total Estimated Due
            </p>
            <p className='text-4xl md:text-5xl font-black text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]'>
              ₹{total_due.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className='glass-panel overflow-hidden'>
        {upcoming.length === 0 ? (
          <div className='p-12 text-center text-slate-500 flex flex-col items-center'>
            <CalendarClock size={48} className='mb-4 opacity-20' />
            <p className='text-lg'>You are completely clear!</p>
            <p className='text-sm mt-1'>
              No upcoming bills predicted for the next 30 days.
            </p>
          </div>
        ) : (
          <table className='w-full text-left border-collapse'>
            <thead className='bg-slate-900/80'>
              <tr>
                <th className='px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                  Bill / Service
                </th>
                <th className='px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                  Predicted Date
                </th>
                <th className='px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right'>
                  Estimated Amount
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-800/50'>
              {upcoming.map((bill, idx) => (
                <tr
                  key={idx}
                  className='hover:bg-slate-800/30 transition-colors'
                >
                  <td className='px-6 py-4 text-sm text-slate-100 font-bold'>
                    {bill.name}
                  </td>
                  <td className='px-6 py-4 text-sm text-slate-300'>
                    {bill.due_date}
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    {bill.days_left <= 3 ? (
                      <span className='px-2 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold border border-rose-500/30'>
                        Due in {bill.days_left} Days
                      </span>
                    ) : (
                      <span className='px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold border border-amber-500/30'>
                        {bill.days_left} Days Away
                      </span>
                    )}
                  </td>
                  <td className='px-6 py-4 text-sm font-black text-amber-400 text-right'>
                    ₹{bill.estimated_amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  )
}

export default UpcomingBillsPage
