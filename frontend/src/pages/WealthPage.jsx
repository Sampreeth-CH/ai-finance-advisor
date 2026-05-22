import React, { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'
import api from '../services/api'
import { motion } from 'framer-motion'
import WealthSimulator from '../components/WealthSimulator'
import FinScoreCard from '../components/FinScoreCard'
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'

const WealthPage = () => {
  const { dashboardData, transactions, fetchDashboard, fetchTransactions } =
    useAppStore()
  const [forecastData, setForecastData] = useState(null)
  const [isPredicting, setIsPredicting] = useState(true)

  useEffect(() => {
    fetchDashboard()
    fetchTransactions()

    // Fetch the futuristic projection data
    const fetchForecast = async () => {
      try {
        const res = await api.get('/forecast/')
        setForecastData(res.data)
      } catch (error) {
        console.error('Failed to load forecast', error)
      } finally {
        setIsPredicting(false)
      }
    }
    fetchForecast()
  }, [fetchDashboard, fetchTransactions])

  const userScore = dashboardData?.fin_score || 650

  // Stitch the past and future together for the chart
  let chartData = []
  if (forecastData && forecastData.historical.length > 0) {
    const past = forecastData.historical.map((d) => ({
      date: d.date,
      Balance: d.balance,
    }))
    const future = forecastData.forecast.map((d) => ({
      date: d.date,
      Projection: d.projected_balance,
    }))

    // Connect the two lines by giving the first future point the last known balance
    future[0].Projection = past[past.length - 1].Balance
    future[0].Balance = past[past.length - 1].Balance

    chartData = [...past, ...future]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 pb-8 max-w-6xl mx-auto'
    >
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-white'>
          Wealth & Future Trajectory
        </h1>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Side: Score & Simulator */}
        <div className='lg:col-span-1 flex flex-col gap-6'>
          <FinScoreCard score={userScore} />

          {transactions && transactions.length > 0 ? (
            <WealthSimulator transactions={transactions} />
          ) : (
            <div className='glass-panel p-6 text-center flex flex-col items-center justify-center text-slate-500 h-full'>
              <ShieldAlert size={48} className='mb-4 opacity-20' />
              <p>Add transactions to unlock the Simulator.</p>
            </div>
          )}
        </div>

        {/* Right Side: The Time Machine (Predictive Forecasting) */}
        <div className='lg:col-span-2 glass-panel p-6 flex flex-col border-cyan-500/20 relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] pointer-events-none rounded-full' />

          <div className='flex justify-between items-start mb-6 relative z-10'>
            <div>
              <h2 className='text-xl font-bold text-white flex items-center gap-2'>
                <Clock className='text-cyan-400' size={20} /> Cashflow Time
                Machine
              </h2>
              <p className='text-sm text-slate-400 mt-1'>
                90-Day Machine Learning Projection
              </p>
            </div>
            {forecastData && (
              <div className='text-right bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl'>
                <p className='text-xs text-slate-500 uppercase tracking-wider font-bold mb-1'>
                  Daily Trajectory
                </p>
                <p
                  className={`text-lg font-bold flex items-center gap-1 justify-end ${forecastData.daily_drift >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  {forecastData.daily_drift >= 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  ₹{Math.abs(forecastData.daily_drift)} / day
                </p>
              </div>
            )}
          </div>

          {/* Critical Warning Alert */}
          {forecastData?.warning && (
            <div className='mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 relative z-10'>
              <AlertTriangle
                className='text-rose-400 shrink-0 mt-0.5'
                size={20}
              />
              <p className='text-rose-200 text-sm font-medium'>
                {forecastData.warning}
              </p>
            </div>
          )}

          {/* The Predictive Chart */}
          <div className='flex-1 min-h-[350px] w-full relative z-10'>
            {isPredicting ? (
              <div className='h-full flex items-center justify-center text-cyan-500/50 animate-pulse'>
                Calculating quantum trajectory...
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id='colorBalance'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#34d399' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#34d399' stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id='colorProjection'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#22d3ee' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#22d3ee' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#1e293b'
                    vertical={false}
                  />
                  <XAxis
                    dataKey='date'
                    stroke='#64748b'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis
                    stroke='#64748b'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(51, 65, 85, 0.5)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <ReferenceLine y={0} stroke='#ef4444' strokeDasharray='3 3' />

                  {/* The Past (Solid Green) */}
                  <Area
                    type='monotone'
                    dataKey='Balance'
                    stroke='#34d399'
                    strokeWidth={3}
                    fill='url(#colorBalance)'
                  />

                  {/* The Future (Dashed Cyan) */}
                  <Area
                    type='monotone'
                    dataKey='Projection'
                    stroke='#22d3ee'
                    strokeWidth={3}
                    strokeDasharray='5 5'
                    fill='url(#colorProjection)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-full flex items-center justify-center text-slate-500'>
                Need more historical data to predict the future.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WealthPage
