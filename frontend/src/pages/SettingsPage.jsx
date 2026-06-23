import React, { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'
import {
  User,
  Mail,
  Shield,
  CheckCircle2,
  Settings2,
  Bell,
  Key,
  Smartphone,
  Globe,
  DownloadCloud,
  Trash2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Custom Animated Toggle Component ---
const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
      enabled ? 'bg-brand-glow' : 'bg-slate-700'
    }`}
  >
    <motion.span
      layout
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)

const SettingsPage = () => {
  const { user, fetchUser } = useAppStore()
  const [activeTab, setActiveTab] = useState('profile')

  // Mock states for advanced settings
  const [settings, setSettings] = useState({
    twoFactor: true,
    weeklyReports: true,
    aiAlerts: false,
    currency: 'INR',
    language: 'English',
  })

  useEffect(() => {
    if (!user) fetchUser()
  }, [user, fetchUser])

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings2 },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='max-w-4xl mx-auto space-y-6 pb-8'
    >
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Account Settings</h1>
          <p className='text-sm text-slate-400 mt-1'>
            Manage your preferences, security, and data.
          </p>
        </div>
      </div>

      <div className='glass-panel overflow-hidden flex flex-col md:flex-row min-h-[600px]'>
        {/* SIDEBAR TABS */}
        <div className='md:w-64 bg-slate-900/50 border-r border-slate-800/60 p-4 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto'>
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
            {/* --- PROFILE TAB --- */}
            {activeTab === 'profile' && (
              <motion.div
                key='profile'
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className='space-y-8'
              >
                <div className='flex items-center gap-5'>
                  <div className='w-20 h-20 rounded-full bg-gradient-to-tr from-brand-glow to-blue-500 p-[2px] shadow-[0_0_20px_rgba(0,240,255,0.3)]'>
                    <div className='w-full h-full rounded-full bg-slate-950 flex items-center justify-center'>
                      <User size={32} className='text-brand-glow' />
                    </div>
                  </div>
                  <div>
                    <h2 className='text-xl font-bold text-white'>
                      {user?.full_name || 'FinTech User'}
                    </h2>
                    <span className='inline-block mt-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium flex items-center gap-1 w-max'>
                      <CheckCircle2 size={12} /> Verified Account
                    </span>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider'>
                      Full Name
                    </label>
                    <div className='glass-input py-3 px-4 text-slate-200'>
                      {user?.full_name || 'Not Provided'}
                    </div>
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider'>
                      Email Address
                    </label>
                    <div className='glass-input py-3 px-4 text-slate-200 flex items-center justify-between'>
                      {user?.email}
                      <Mail size={16} className='text-slate-500' />
                    </div>
                  </div>
                </div>

                <div className='pt-6 border-t border-slate-800'>
                  <h3 className='text-lg font-medium text-white mb-4 flex items-center gap-2'>
                    <DownloadCloud size={18} className='text-brand-glow' /> Data
                    Management
                  </h3>
                  <div className='bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4'>
                    <div>
                      <p className='text-sm font-medium text-slate-200'>
                        Export Financial History
                      </p>
                      <p className='text-xs text-slate-500 mt-1'>
                        Download all your raw transaction data as a JSON file.
                      </p>
                    </div>
                    <button className='px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700'>
                      Request Export
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- PREFERENCES TAB --- */}
            {activeTab === 'preferences' && (
              <motion.div
                key='preferences'
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className='space-y-8'
              >
                <div>
                  <h3 className='text-lg font-medium text-white mb-4'>
                    Application Settings
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2'>
                        <Globe size={14} /> Base Currency
                      </label>
                      <select
                        className='w-full glass-input py-3 px-4 text-slate-200 appearance-none bg-slate-950'
                        value={settings.currency}
                        onChange={(e) =>
                          setSettings({ ...settings, currency: e.target.value })
                        }
                      >
                        <option value='INR'>₹ Indian Rupee (INR)</option>
                        <option value='USD'>$ US Dollar (USD)</option>
                        <option value='EUR'>€ Euro (EUR)</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2'>
                        <Smartphone size={14} /> App Language
                      </label>
                      <select
                        className='w-full glass-input py-3 px-4 text-slate-200 appearance-none bg-slate-950'
                        value={settings.language}
                        onChange={(e) =>
                          setSettings({ ...settings, language: e.target.value })
                        }
                      >
                        <option value='English'>English</option>
                        <option value='Hindi'>Hindi</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className='pt-6 border-t border-slate-800'>
                  <h3 className='text-lg font-medium text-white mb-4 flex items-center gap-2'>
                    <Bell size={18} className='text-brand-glow' /> AI &
                    Notifications
                  </h3>

                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800/80 rounded-xl hover:bg-slate-800/30 transition-colors'>
                      <div>
                        <p className='text-sm font-medium text-slate-200'>
                          Weekly Executive Report
                        </p>
                        <p className='text-xs text-slate-500 mt-1'>
                          Receive an AI-generated PDF summary every Monday.
                        </p>
                      </div>
                      <Toggle
                        enabled={settings.weeklyReports}
                        onToggle={() => toggleSetting('weeklyReports')}
                      />
                    </div>

                    <div className='flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800/80 rounded-xl hover:bg-slate-800/30 transition-colors'>
                      <div>
                        <p className='text-sm font-medium text-slate-200'>
                          AI Overspending Alerts
                        </p>
                        <p className='text-xs text-slate-500 mt-1'>
                          Get notified immediately if you exceed your category
                          limits.
                        </p>
                      </div>
                      <Toggle
                        enabled={settings.aiAlerts}
                        onToggle={() => toggleSetting('aiAlerts')}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === 'security' && (
              <motion.div
                key='security'
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className='space-y-8'
              >
                <div>
                  <h3 className='text-lg font-medium text-white mb-4 flex items-center gap-2'>
                    <Shield size={18} className='text-brand-glow' /> Account
                    Security
                  </h3>

                  <div className='flex items-center justify-between p-5 bg-slate-900/50 border border-slate-800 rounded-xl'>
                    <div className='flex items-start gap-4'>
                      <div className='p-2 bg-brand-glow/10 text-brand-glow rounded-lg'>
                        <Key size={20} />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-white'>
                          Two-Factor Authentication (2FA)
                        </p>
                        <p className='text-xs text-slate-400 mt-1 max-w-sm leading-relaxed'>
                          Add an extra layer of security to your account by
                          requiring a code from your authenticator app.
                        </p>
                      </div>
                    </div>
                    <Toggle
                      enabled={settings.twoFactor}
                      onToggle={() => toggleSetting('twoFactor')}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <button className='px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium text-white transition-colors flex justify-center items-center gap-2'>
                    <Key size={16} /> Change Password
                  </button>
                  <button className='px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium text-white transition-colors flex justify-center items-center gap-2'>
                    <Smartphone size={16} /> Active Sessions
                  </button>
                </div>

                <div className='pt-8 border-t border-slate-800'>
                  <h3 className='text-lg font-medium text-rose-500 mb-4'>
                    Danger Zone
                  </h3>
                  <div className='p-5 border border-rose-500/20 bg-rose-500/5 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4'>
                    <div>
                      <p className='text-sm font-bold text-rose-400'>
                        Delete Account
                      </p>
                      <p className='text-xs text-rose-500/70 mt-1'>
                        Permanently delete your data and financial history.
                      </p>
                    </div>
                    <button className='px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-sm font-medium rounded-lg transition-colors border border-rose-500/30 flex items-center gap-2'>
                      <Trash2 size={16} /> Delete Account
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
