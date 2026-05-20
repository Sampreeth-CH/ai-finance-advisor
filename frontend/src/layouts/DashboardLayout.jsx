import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Settings,
  LogOut,
  Wallet,
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import FloatingAssistant from '../features/ai-chat/FloatingAssistant'

const DashboardLayout = () => {
  const logout = useAppStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    {
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
    },
    {
      path: '/transactions',
      icon: <Receipt size={20} />,
      label: 'Transactions',
    },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ]

  return (
    <div className='flex h-screen bg-slate-950 text-slate-100 overflow-hidden relative'>
      {/* Background glow effects */}
      <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-glow/10 blur-[120px] pointer-events-none' />
      <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none' />

      {/* Sidebar */}
      <aside className='w-64 glass-panel m-4 flex flex-col justify-between z-10'>
        <div>
          <div className='p-6 flex items-center gap-3 border-b border-slate-800/60'>
            <div className='w-8 h-8 rounded-lg bg-brand-glow/20 flex items-center justify-center border border-brand-glow/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'>
              <Wallet className='text-brand-glow' size={20} />
            </div>
            <h1 className='text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400'>
              AI Finance
            </h1>
          </div>
          <nav className='p-4 space-y-2'>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-glow/10 text-brand-glow border border-brand-glow/30 shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`
                }
              >
                {item.icon}
                <span className='font-medium'>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className='p-4 border-t border-slate-800/60'>
          <button
            onClick={handleLogout}
            className='flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-transparent transition-all duration-300'
          >
            <LogOut size={20} />
            <span className='font-medium'>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 overflow-y-auto p-4 pl-0 z-10 relative'>
        <div className='h-full rounded-xl overflow-hidden'>
          <Outlet />
        </div>
      </main>

      <FloatingAssistant />
    </div>
  )
}

export default DashboardLayout
