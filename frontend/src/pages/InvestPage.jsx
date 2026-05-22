import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { motion } from 'framer-motion'
import { PiggyBank, TrendingUp, Coins } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const InvestPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoundUps = async () => {
      try {
        const res = await api.get('/roundups/')
        setData(res.data)
      } catch (error) {
        console.error('Failed to load roundups', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRoundUps()
  }, [])

  if (loading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.5)]'></div>
      </div>
    )
  }

  const { total_invested, monthly_average, transactions, projection } =
    data || {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 pb-8 max-w-6xl mx-auto'
    >
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-white flex items-center gap-2'>
            <PiggyBank className='text-emerald-400' /> Micro-Investing
          </h1>
          <p className='text-sm text-slate-400 mt-1'>
            Rounding up your spare change to build wealth.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Stats Card */}
        <div className='glass-panel p-8 bg-gradient-to-br from-slate-900 to-emerald-950/20 relative overflow-hidden'>
          <div className='absolute -right-4 -bottom-4 opacity-10'>
            <TrendingUp size={150} className='text-emerald-500' />
          </div>
          <h2 className='text-lg font-bold text-emerald-400 flex items-center gap-2 relative z-10'>
            <Coins size={20} /> Spare Change Accumulated
          </h2>
          <p className='text-5xl font-black text-emerald-500 mt-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] relative z-10'>
            ₹
            {total_invested?.toLocaleString('en-IN', {
              maximumFractionDigits: 0,
            })}
          </p>
          <p className='text-sm text-slate-300 mt-2 relative z-10 font-medium'>
            Projected Savings:{' '}
            <span className='text-white font-bold'>
              ₹
              {monthly_average?.toLocaleString('en-IN', {
                maximumFractionDigits: 0,
              })}{' '}
              / month
            </span>
          </p>
        </div>

        {/* Compound Interest Chart */}
        <div className='glass-panel p-6 flex flex-col min-h-[300px]'>
          <h2 className='text-lg font-bold text-white mb-1'>
            10-Year Projection
          </h2>
          <p className='text-xs text-slate-400 mb-6'>
            If you invest this spare change at 12% annually
          </p>

          <div className='flex-1 w-full min-h-[200px]'>
            {projection && projection.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={projection}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id='colorWealth'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#10b981' stopOpacity={0.5} />
                      <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#1e293b'
                    vertical={false}
                  />
                  <XAxis
                    dataKey='year'
                    stroke='#64748b'
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke='#64748b'
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(51, 65, 85, 0.5)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    formatter={(value) => [
                      `₹${value.toLocaleString()}`,
                      'Projected Wealth',
                    ]}
                  />
                  <Area
                    type='monotone'
                    dataKey='projected_wealth'
                    stroke='#10b981'
                    strokeWidth={3}
                    fill='url(#colorWealth)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex items-center justify-center h-full text-slate-500 text-sm'>
                Not enough data to project.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The Round-Ups Ledger */}
      <div className='glass-panel overflow-hidden'>
        <div className='p-4 border-b border-slate-800/60 bg-slate-900/40'>
          <h3 className='text-lg font-medium text-white'>Recent Round-Ups</h3>
        </div>
        <div className='max-h-[400px] overflow-y-auto'>
          {transactions?.length === 0 ? (
            <div className='p-8 text-center text-slate-500'>
              No round-ups detected yet.
            </div>
          ) : (
            <table className='w-full text-left border-collapse'>
              <thead className='bg-slate-900/80 sticky top-0 z-10'>
                <tr>
                  <th className='px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Date
                  </th>
                  <th className='px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Transaction
                  </th>
                  <th className='px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Original
                  </th>
                  <th className='px-6 py-4 text-xs font-semibold text-emerald-400 uppercase tracking-wider text-right'>
                    Invested
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-800/50'>
                {transactions?.map((tx, idx) => (
                  <tr
                    key={idx}
                    className='hover:bg-slate-800/30 transition-colors'
                  >
                    <td className='px-6 py-4 text-sm text-slate-400'>
                      {tx.date}
                    </td>
                    <td className='px-6 py-4 text-sm text-slate-100 font-medium'>
                      {tx.name}
                    </td>
                    <td className='px-6 py-4 text-sm text-slate-400'>
                      ₹{tx.original}
                    </td>
                    <td className='px-6 py-4 text-sm font-black text-emerald-400 text-right'>
                      + ₹{tx.invested}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default InvestPage
