import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

import WealthSimulator from '../components/WealthSimulator'
import FinScoreCard from '../components/FinScoreCard'
// --- NEW: Import the Shared Wallets Component ---
import ReceivablesWidget from '../components/ReceivablesWidget'

const DashboardPage = () => {
  const {
    dashboardData,
    transactions,
    fetchDashboard,
    fetchTransactions,
    loading,
    error,
  } = useAppStore()

  useEffect(() => {
    fetchDashboard()
    fetchTransactions()
  }, [fetchDashboard, fetchTransactions])

  // SAFETY FIX 1: Handle errors gracefully so it doesn't spin forever
  if (error && !dashboardData) {
    return (
      <div className='h-full flex flex-col items-center justify-center text-center space-y-4'>
        <AlertCircle className='w-12 h-12 text-rose-500' />
        <h2 className='text-xl font-bold text-white'>
          Failed to load Dashboard
        </h2>
        <p className='text-slate-400'>{error}</p>
      </div>
    )
  }

  // SAFETY FIX 2: Explain to the user why the loading takes so long!
  if (loading || !dashboardData) {
    return (
      <div className='h-full flex flex-col items-center justify-center space-y-6'>
        <div className='w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]' />
        <div className='text-center'>
          <p className='text-slate-300 font-medium animate-pulse text-lg'>
            AI is analyzing your finances...
          </p>
          <p className='text-slate-500 text-sm mt-2 max-w-sm'>
            (Your local Llama 3 model is reading your history and generating a
            personalized report. This may take 15-30 seconds.)
          </p>
        </div>
      </div>
    )
  }

  // --- NEW: Extract fin_score AND receivables from the backend data ---
  const { analysis, ai_advisor, fin_score, receivables } = dashboardData
  const userScore = fin_score || 650 // Default fallback while calculating

  // SAFETY FIX 3: Force Pandas data into safe JavaScript structures
  const chartData =
    analysis && analysis.category_spending
      ? Object.entries(analysis.category_spending).map(([name, amount]) => ({
          name: String(name),
          amount: Number(amount) || 0, // Forces it to be a valid number
        }))
      : []

  const StatCard = ({ title, amount, icon, isPositive }) => {
    // SAFETY FIX 4: Prevent React .toFixed() crashes by guaranteeing a number type
    const safeAmount = Number(amount) || 0

    return (
      <div className='glass-panel p-6 flex items-center gap-4'>
        <div
          className={`p-4 rounded-xl ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} shadow-lg`}
        >
          {icon}
        </div>
        <div>
          <h3 className='text-sm font-medium text-slate-400'>{title}</h3>
          <p className='text-2xl font-bold text-slate-100'>
            ₹{safeAmount.toFixed(2)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 h-full flex flex-col'
    >
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-white'>Financial Overview</h1>
      </div>

      {/* --- The Wealth Simulator Component --- */}
      {transactions && transactions.length > 0 && (
        <WealthSimulator transactions={transactions} />
      )}

      {/* --- The FinScore Gamification Component --- */}
      <FinScoreCard score={userScore} />

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <StatCard
          title='Total Income'
          amount={analysis?.total_income}
          icon={<TrendingUp size={24} />}
          isPositive={true}
        />
        <StatCard
          title='Total Expenses'
          amount={analysis?.total_expense}
          icon={<TrendingDown size={24} />}
          isPositive={false}
        />
        <StatCard
          title='Net Allocation'
          amount={analysis?.net_allocation}
          icon={<DollarSign size={24} />}
          isPositive={Number(analysis?.net_allocation) >= 0}
        />
      </div>

      {/* Main Content Area */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Chart Area */}
        <div className='lg:col-span-2 glass-panel p-6 flex flex-col'>
          <h2 className='text-lg font-semibold text-white mb-6'>
            Spending by Category
          </h2>
          <div className='flex-1 min-h-[300px]'>
            {chartData.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#1e293b'
                    vertical={false}
                  />
                  <XAxis
                    dataKey='name'
                    stroke='#64748b'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke='#64748b'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(51, 65, 85, 0.5)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    itemStyle={{ color: '#00f0ff' }}
                  />
                  <Bar dataKey='amount' radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? '#00f0ff' : '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-full flex items-center justify-center text-slate-500'>
                No spending data available
              </div>
            )}
          </div>
        </div>

        {/* --- NEW: The Shared Wallets Widget --- */}
        <div className='lg:col-span-1 h-[400px] lg:h-auto'>
          <ReceivablesWidget receivables={receivables} />
        </div>
      </div>

      {/* AI Insights Area */}
      <div className='glass-panel p-6 flex flex-col border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] pointer-events-none rounded-full' />

        <div className='flex items-center gap-3 mb-6'>
          <div className='p-2 bg-cyan-500/20 rounded-lg'>
            <Sparkles className='text-cyan-400 w-5 h-5' />
          </div>
          <h2 className='text-lg font-semibold text-white'>
            AI Advisor Insights
          </h2>
        </div>

        <div className='flex-1 overflow-y-auto pr-2'>
          {ai_advisor ? (
            <div className='text-slate-300 leading-relaxed text-sm'>
              <ReactMarkdown
                components={{
                  strong: ({ node, ...props }) => (
                    <span className='font-bold text-cyan-400' {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className='mb-3 last:mb-0' {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className='list-disc ml-5 mb-3 space-y-1' {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className='mb-1' {...props} />
                  ),
                }}
              >
                {String(ai_advisor)}
              </ReactMarkdown>
            </div>
          ) : (
            <p className='text-slate-500 italic'>
              No AI insights generated yet. Add more transactions to get
              personalized advice.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default DashboardPage
