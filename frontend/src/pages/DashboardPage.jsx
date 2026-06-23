import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import api from '../services/api'
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
  DownloadCloud,
} from 'lucide-react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

import WealthSimulator from '../components/WealthSimulator'
import FinScoreCard from '../components/FinScoreCard'
import ReceivablesWidget from '../components/ReceivablesWidget'
import { Link } from 'react-router-dom'

const DashboardPage = () => {
  const {
    dashboardData,
    transactions,
    fetchDashboard,
    fetchTransactions,
    loading,
    error,
    aiInsight, // --- NEW ---
    insightLoading, // --- NEW ---
  } = useAppStore()

  useEffect(() => {
    fetchDashboard()
    fetchTransactions()
  }, [fetchDashboard, fetchTransactions])

  const handleDownloadReport = async () => {
    try {
      const res = await api.get('/export/dashboard/', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Executive_Report.pdf')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      alert('Failed to generate report.')
      console.error(error)
    }
  }

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

  if (loading || !dashboardData) {
    return (
      <div className='h-full flex flex-col items-center justify-center space-y-6'>
        <div className='relative flex items-center justify-center'>
          <div className='w-16 h-16 border-4 border-slate-800 rounded-full'></div>
          <div className='w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin absolute shadow-[0_0_15px_rgba(6,182,212,0.5)]'></div>
          <Sparkles
            className='absolute text-cyan-400 animate-pulse'
            size={20}
          />
        </div>
        <div className='text-center'>
          <p className='text-slate-200 font-medium animate-pulse text-lg tracking-wide'>
            Syncing Financial Data...
          </p>
        </div>
      </div>
    )
  }

  // Notice we removed ai_advisor from here
  const { analysis, fin_score, receivables } = dashboardData
  const userScore = fin_score || 650

  const chartData =
    analysis && analysis.category_spending
      ? Object.entries(analysis.category_spending).map(([name, amount]) => ({
          name: String(name),
          amount: Number(amount) || 0,
        }))
      : []

  const StatCard = ({ title, amount, icon, isPositive }) => {
    const safeAmount = Number(amount) || 0
    return (
      <div className='glass-panel p-5 flex items-center gap-4 hover:border-brand-glow/30 transition-colors'>
        <div
          className={`p-3 rounded-xl ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} shadow-lg`}
        >
          {icon}
        </div>
        <div>
          <h3 className='text-sm font-medium text-slate-400'>{title}</h3>
          <p className='text-2xl font-bold text-slate-100'>
            ₹{safeAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 pb-8'
    >
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-white'>Master Overview</h1>
        <button
          onClick={handleDownloadReport}
          className='flex items-center gap-2 px-4 py-2 bg-brand-glow text-slate-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]'
        >
          <DownloadCloud size={18} />
          Export PDF
        </button>
      </div>

      {/* ROW 1: Summary Metrics */}
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
          amount={
            (Number(analysis?.total_income) || 0) -
            (Number(analysis?.total_expense) || 0)
          }
          icon={<DollarSign size={24} />}
          isPositive={
            (Number(analysis?.total_income) || 0) -
              (Number(analysis?.total_expense) || 0) >=
            0
          }
        />
      </div>

      {/* ROW 2: Chart (Left) + FinScore (Right) */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Chart Area */}
        <div className='lg:col-span-2 glass-panel p-6 flex flex-col h-[400px]'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-lg font-semibold text-white'>
              Spending by Category
            </h2>
            <Link
              to='/transactions'
              className='text-xs text-brand-glow hover:underline'
            >
              View All →
            </Link>
          </div>
          <div className='flex-1 min-h-0 w-full'>
            {chartData.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={chartData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
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

        {/* Gamification Area */}
        <div className='lg:col-span-1 h-[400px]'>
          <FinScoreCard score={userScore} />
        </div>
      </div>

      {/* ROW 3: Wealth Simulator (Left) + Shared Wallets (Right) */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Wealth Simulator */}
        <div className='lg:col-span-2 flex flex-col h-full'>
          {transactions && transactions.length > 0 ? (
            <div className='h-full'>
              <WealthSimulator transactions={transactions} />
            </div>
          ) : (
            <div className='glass-panel p-6 flex flex-col items-center justify-center h-full text-slate-500'>
              <p>Add transactions to unlock the Wealth Simulator.</p>
            </div>
          )}
        </div>

        {/* Shared Wallets */}
        <div className='lg:col-span-1 h-[350px] lg:h-auto'>
          <ReceivablesWidget receivables={receivables} />
        </div>
      </div>

      {/* ROW 4: AI Insights Brief (NOW ASYNC LAZY-LOADED) */}
      <div className='glass-panel p-6 flex flex-col border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] pointer-events-none rounded-full' />

        <div className='flex items-center justify-between mb-4 relative z-10'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-cyan-500/20 rounded-lg'>
              <Sparkles className='text-cyan-400 w-5 h-5' />
            </div>
            <h2 className='text-lg font-semibold text-white'>
              AI Copilot Summary
            </h2>
          </div>
          <Link to='/advisor' className='text-xs text-cyan-400 hover:underline'>
            Deep Dive →
          </Link>
        </div>

        <div className='max-h-[250px] overflow-y-auto pr-2 relative z-10'>
          {insightLoading ? (
            <div className='flex items-center gap-3 text-cyan-400 py-4'>
              <div className='w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin'></div>
              <p className='text-sm font-medium animate-pulse'>
                Llama 3.3 is analyzing your latest data...
              </p>
            </div>
          ) : aiInsight ? (
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
                {String(aiInsight)}
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
