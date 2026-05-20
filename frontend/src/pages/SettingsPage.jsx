import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { User, Mail, Shield, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

const SettingsPage = () => {
  const { user, fetchUser } = useAppStore()

  useEffect(() => {
    if (!user) {
      fetchUser()
    }
  }, [user, fetchUser])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-6 h-full'
    >
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-white'>Settings</h1>
      </div>

      <div className='max-w-2xl'>
        <div className='glass-panel overflow-hidden'>
          <div className='p-6 border-b border-slate-800/60 bg-slate-900/60 flex items-center gap-4'>
            <div className='w-16 h-16 rounded-full bg-brand-glow/20 flex items-center justify-center border-2 border-brand-glow/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]'>
              <User size={32} className='text-brand-glow' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>
                Profile Information
              </h2>
              <p className='text-sm text-slate-400'>
                Manage your account details and preferences.
              </p>
            </div>
          </div>

          <div className='p-6 space-y-6'>
            {user ? (
              <>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2'>
                      <Shield size={14} /> User ID
                    </label>
                    <div className='glass-input bg-slate-900/80 text-slate-300 font-mono text-sm'>
                      {user.id}
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2'>
                      <Mail size={14} /> Email Address
                    </label>
                    <div className='glass-input bg-slate-900/80 text-slate-300'>
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className='pt-6 mt-6 border-t border-slate-800/60'>
                  <h3 className='text-lg font-medium text-white mb-4'>
                    System Status
                  </h3>
                  <div className='flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'>
                    <CheckCircle2 size={20} />
                    <div>
                      <p className='font-medium'>Backend Connected</p>
                      <p className='text-xs text-emerald-500/70 mt-0.5'>
                        Secure connection established with API server
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className='flex justify-center py-8'>
                <div className='w-8 h-8 border-4 border-brand-glow border-t-transparent rounded-full animate-spin' />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SettingsPage
