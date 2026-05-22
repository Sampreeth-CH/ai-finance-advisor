import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { motion } from 'framer-motion'
import WealthSimulator from '../components/WealthSimulator'
import FinScoreCard from '../components/FinScoreCard'
import { ShieldAlert } from 'lucide-react'

const WealthPage = () => {
  const { dashboardData, transactions, fetchDashboard, fetchTransactions } =
    useAppStore()

  useEffect(() => {
    fetchDashboard()
    fetchTransactions()
  }, [fetchDashboard, fetchTransactions])

  const userScore = dashboardData?.fin_score || 650

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 pb-8'
    >
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-white'>Wealth & Score</h1>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        <FinScoreCard score={userScore} />

        {transactions && transactions.length > 0 ? (
          <WealthSimulator transactions={transactions} />
        ) : (
          <div className='glass-panel p-8 text-center flex flex-col items-center justify-center text-slate-500'>
            <ShieldAlert size={48} className='mb-4 opacity-20' />
            <p className='text-lg'>Not enough data for the Wealth Simulator.</p>
            <p className='text-sm mt-2'>
              Add your recent spending to see what you could have saved!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default WealthPage
