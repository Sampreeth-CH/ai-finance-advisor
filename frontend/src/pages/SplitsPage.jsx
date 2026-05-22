import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { motion } from 'framer-motion'
import ReceivablesWidget from '../components/ReceivablesWidget'

const SplitsPage = () => {
  const { dashboardData, fetchDashboard } = useAppStore()

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const receivables = dashboardData?.receivables || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 pb-8 h-full flex flex-col'
    >
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-white'>Shared Wallets</h1>
      </div>

      <div className='flex-1 min-h-[500px]'>
        <ReceivablesWidget receivables={receivables} />
      </div>
    </motion.div>
  )
}

export default SplitsPage
