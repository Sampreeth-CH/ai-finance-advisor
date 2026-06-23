import React, { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { translations } from '../utils/translations' // Adjust path if needed
import {
  Settings2,
  Globe,
  Smartphone,
  DownloadCloud,
  Trash2,
  Database,
  Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SettingsPage = () => {
  // Pull from our global Zustand store!
  const {
    dashboardData,
    logout,
    language,
    currency,
    setLanguage,
    setCurrency,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('preferences')
  const [showToast, setShowToast] = useState(false)

  // Get the correct language dictionary
  const t = translations[language] || translations.English

  const triggerToast = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value)
    triggerToast()
  }

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value)
    triggerToast()
  }

  // --- REAL FUNCTIONAL ACTIONS ---
  const handleExportData = () => {
    if (!dashboardData) {
      alert('No financial data found to export.')
      return
    }
    const dataStr = JSON.stringify(dashboardData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financial_export_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDeleteAccount = () => {
    const isConfirmed = window.confirm(
      'DANGER: Are you absolutely sure? This will permanently delete your local data and log you out.',
    )
    if (isConfirmed) {
      // Clears local storage and logs out
      localStorage.clear()
      logout()
    }
  }

  const tabs = [
    { id: 'preferences', label: t.preferences, icon: Settings2 },
    { id: 'data', label: t.dataPrivacy, icon: Database },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='max-w-4xl mx-auto space-y-6 pb-8 h-full flex flex-col relative'
    >
      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='absolute top-0 right-0 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium z-50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          >
            <Check size={16} /> {t.saved}
          </motion.div>
        )}
      </AnimatePresence>

      <div className='flex justify-between items-center shrink-0'>
        <div>
          <h1 className='text-2xl font-bold text-white'>{t.settingsTitle}</h1>
          <p className='text-sm text-slate-400 mt-1'>{t.settingsDesc}</p>
        </div>
      </div>

      <div className='glass-panel overflow-hidden flex flex-col md:flex-row flex-1 min-h-[500px]'>
        {/* SIDEBAR TABS */}
        <div className='md:w-64 bg-slate-900/50 border-r border-slate-800/60 p-4 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto custom-scrollbar'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-glow/10 text-brand-glow border border-brand-glow/20 shadow-[0_0_15px_rgba(0,240,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon size={18} />
                <span className='font-medium text-sm'>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB CONTENT */}
        <div className='flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar'>
          <AnimatePresence mode='wait'>
            {/* --- PREFERENCES TAB --- */}
            {activeTab === 'preferences' && (
              <motion.div
                key='preferences'
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className='space-y-8'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2'>
                      <Globe size={14} /> {t.baseCurrency}
                    </label>
                    <select
                      className='w-full glass-input py-3 px-4 text-slate-200 appearance-none bg-slate-950 cursor-pointer'
                      value={currency}
                      onChange={handleCurrencyChange}
                    >
                      <option value='INR'>₹ Indian Rupee (INR)</option>
                      <option value='USD'>$ US Dollar (USD)</option>
                      <option value='EUR'>€ Euro (EUR)</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2'>
                      <Smartphone size={14} /> AI Copilot Language
                    </label>
                    <select
                      className='w-full glass-input py-3 px-4 text-slate-200 appearance-none bg-slate-950 cursor-pointer'
                      value={language}
                      onChange={handleLanguageChange}
                    >
                      <option value='English'>English</option>
                      <option value='Hindi'>हिंदी (Hindi)</option>
                      <option value='Kannada'>ಕನ್ನಡ (Kannada)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- DATA & PRIVACY TAB --- */}
            {activeTab === 'data' && (
              <motion.div
                key='data'
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className='space-y-8'
              >
                <div>
                  <h3 className='text-lg font-medium text-white mb-4 flex items-center gap-2'>
                    <DownloadCloud size={18} className='text-brand-glow' />{' '}
                    {t.dataManagement}
                  </h3>
                  <div className='bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4'>
                    <div>
                      <p className='text-sm font-medium text-slate-200'>
                        {t.exportData}
                      </p>
                      <p className='text-xs text-slate-500 mt-1'>
                        {t.exportDesc}
                      </p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className='px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 active:scale-95 whitespace-nowrap'
                    >
                      {t.downloadBtn}
                    </button>
                  </div>
                </div>

                <div className='pt-6 border-t border-slate-800'>
                  <h3 className='text-lg font-medium text-rose-500 mb-4 flex items-center gap-2'>
                    <Trash2 size={18} /> {t.dangerZone}
                  </h3>
                  <div className='p-5 border border-rose-500/20 bg-rose-500/5 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4'>
                    <div>
                      <p className='text-sm font-bold text-rose-400'>
                        {t.deleteAccount}
                      </p>
                      <p className='text-xs text-rose-500/70 mt-1'>
                        {t.deleteDesc}
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className='px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-sm font-medium rounded-lg transition-colors border border-rose-500/30 flex items-center gap-2 active:scale-95 whitespace-nowrap'
                    >
                      <Trash2 size={16} /> {t.deleteBtn}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default SettingsPage
