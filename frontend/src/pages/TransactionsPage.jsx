import React, { useEffect, useState, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import api from '../services/api'
import { UploadCloud, Plus, FileText, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

// Add this helper function to format as Indian Rupees (INR)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

const TransactionsPage = () => {
  const { transactions, fetchTransactions, loading } = useAppStore()
  const [isUploading, setIsUploading] = useState(false)
  const [manualEntries, setManualEntries] = useState([
    { description: '', amount: '' },
  ])
  const [isSubmittingManual, setIsSubmittingManual] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setIsUploading(true)
    try {
      await api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await fetchTransactions()
    } catch (error) {
      console.error('Failed to upload file', error)
      alert('File upload failed. Please check the format.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleManualAdd = () => {
    setManualEntries([...manualEntries, { description: '', amount: '' }])
  }

  const handleManualRemove = (index) => {
    const newEntries = [...manualEntries]
    newEntries.splice(index, 1)
    setManualEntries(newEntries)
  }

  const handleManualChange = (index, field, value) => {
    const newEntries = [...manualEntries]
    newEntries[index][field] = value
    setManualEntries(newEntries)
  }

  const submitManualEntries = async (e) => {
    e.preventDefault()

    const validEntries = manualEntries
      .filter((entry) => entry.description.trim() && entry.amount !== '')
      .map((entry) => ({
        Description: entry.description,
        Amount: parseFloat(entry.amount),
      }))

    if (validEntries.length === 0) return

    setIsSubmittingManual(true)
    try {
      await api.post('/manual/', validEntries)
      setManualEntries([{ description: '', amount: '' }])
      await fetchTransactions()
    } catch (error) {
      console.error('Failed to submit manual transactions', error)
      alert('Failed to submit transactions.')
    } finally {
      setIsSubmittingManual(false)
    }
  }

  // --- NEW: Clear History Function ---
  const handleClearHistory = async () => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete ALL your transactions? This cannot be undone.',
    )

    if (isConfirmed) {
      try {
        await api.delete('/clear/')
        await fetchTransactions() // Refresh the table to show it is empty
      } catch (error) {
        console.error('Failed to clear history', error)
        alert('Failed to clear history. Please try again.')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 h-full flex flex-col'
    >
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-white'>Transactions</h1>

        {/* --- NEW: Clear History Button --- */}
        <button
          onClick={handleClearHistory}
          className='flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 rounded-lg transition-colors text-sm font-medium'
        >
          <Trash2 size={16} />
          Reset History
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Upload Section */}
        <div
          className='glass-panel p-6 flex flex-col items-center justify-center border-dashed border-2 hover:border-brand-glow/50 transition-colors cursor-pointer group'
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept='.csv,.pdf'
            className='hidden'
          />
          <div className='w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 group-hover:bg-brand-glow/10 group-hover:text-brand-glow transition-colors'>
            {isUploading ? (
              <div className='w-8 h-8 border-4 border-brand-glow border-t-transparent rounded-full animate-spin' />
            ) : (
              <UploadCloud
                size={32}
                className='text-slate-400 group-hover:text-brand-glow'
              />
            )}
          </div>
          <h3 className='text-lg font-medium text-white mb-1'>
            Upload Statement
          </h3>
          <p className='text-sm text-slate-400 text-center'>
            Drag & drop or click to upload
            <br />
            CSV or PDF files
          </p>
        </div>

        {/* Manual Entry Form */}
        <div className='lg:col-span-2 glass-panel p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-medium text-white'>Quick Add</h3>
            <button
              type='button'
              onClick={handleManualAdd}
              className='text-brand-glow hover:text-white flex items-center gap-1 text-sm bg-brand-glow/10 px-3 py-1 rounded-full transition-colors'
            >
              <Plus size={16} /> Add Row
            </button>
          </div>
          <form onSubmit={submitManualEntries} className='space-y-3'>
            {manualEntries.map((entry, index) => (
              <div key={index} className='flex gap-3 items-start'>
                <input
                  type='text'
                  placeholder='Description (e.g. Groceries)'
                  value={entry.description}
                  onChange={(e) =>
                    handleManualChange(index, 'description', e.target.value)
                  }
                  className='glass-input flex-1'
                  required
                />
                <input
                  type='number'
                  step='0.01'
                  placeholder='Amount'
                  value={entry.amount}
                  onChange={(e) =>
                    handleManualChange(index, 'amount', e.target.value)
                  }
                  className='glass-input w-32'
                  required
                />
                {manualEntries.length > 1 && (
                  <button
                    type='button'
                    onClick={() => handleManualRemove(index)}
                    className='p-2 text-slate-500 hover:text-red-400 mt-1 transition-colors'
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <div className='flex justify-end pt-2'>
              <button
                type='submit'
                disabled={isSubmittingManual}
                className='glass-button w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white'
              >
                {isSubmittingManual ? 'Saving...' : 'Save Transactions'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Transactions Table */}
      <div className='glass-panel flex-1 flex flex-col min-h-0 overflow-hidden'>
        <div className='p-4 border-b border-slate-800/60 bg-slate-900/40'>
          <h3 className='text-lg font-medium text-white flex items-center gap-2'>
            <FileText size={18} className='text-brand-glow' /> Recent Activity
          </h3>
        </div>
        <div className='flex-1 overflow-y-auto p-0'>
          {loading ? (
            <div className='flex items-center justify-center h-32'>
              <div className='w-8 h-8 border-4 border-brand-glow border-t-transparent rounded-full animate-spin' />
            </div>
          ) : transactions.length === 0 ? (
            <div className='text-center text-slate-500 py-12'>
              No transactions found. Upload a file or add manually.
            </div>
          ) : (
            <table className='w-full text-left border-collapse'>
              <thead className='bg-slate-900/60 sticky top-0'>
                <tr>
                  <th className='px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Date
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Description
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Category
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right'>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-800/50'>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className='hover:bg-slate-800/30 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-slate-300'>
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 text-sm text-slate-100 font-medium'>
                      {tx.description}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      <span className='px-2 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700'>
                        {tx.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${tx.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}
                    >
                      {tx.amount < 0 ? '-' : '+'}
                      {formatCurrency(Math.abs(tx.amount))}
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

export default TransactionsPage
