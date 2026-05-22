import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Settings,
  LogOut,
  Wallet,
  Menu,
  X,
  PieChart,
  Users,
  Bot,
  User,
  Repeat,
  CalendarClock,
  PiggyBank, // --- NEW: Imported PiggyBank icon
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import FloatingAssistant from '../features/ai-chat/FloatingAssistant'

const DashboardLayout = () => {
  const logout = useAppStore((state) => state.logout)
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    {
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      label: 'Overview',
    },
    {
      path: '/transactions',
      icon: <Receipt size={20} />,
      label: 'Transactions',
    },
    {
      path: '/subscriptions',
      icon: <Repeat size={20} />,
      label: 'Subscriptions',
    },
    {
      path: '/upcoming',
      icon: <CalendarClock size={20} />,
      label: 'Upcoming Bills',
    },
    // --- NEW: Micro-Invest Menu Item ---
    {
      path: '/invest',
      icon: <PiggyBank size={20} />,
      label: 'Micro-Invest',
    },
    { path: '/wealth', icon: <PieChart size={20} />, label: 'Wealth & Score' },
    { path: '/splits', icon: <Users size={20} />, label: 'Shared Wallets' },
    { path: '/advisor', icon: <Bot size={20} />, label: 'AI Copilot' },
    { path: '/profile', icon: <User size={20} />, label: 'My Profile' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ]

  const handleNavClick = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className='flex h-screen bg-slate-950 text-slate-100 overflow-hidden relative'>
      <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-glow/10 blur-[120px] pointer-events-none z-0' />
      <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none z-0' />

      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 glass-panel m-0 lg:m-4 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className='p-6 flex items-center justify-between border-b border-slate-800/60'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-lg bg-brand-glow/20 flex items-center justify-center border border-brand-glow/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'>
                <Wallet className='text-brand-glow' size={20} />
              </div>
              <h1 className='text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400'>
                AI Finance
              </h1>
            </div>
            <button
              className='lg:hidden text-slate-400 hover:text-white transition-colors'
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <nav className='p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]'>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
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

      <div className='flex-1 flex flex-col h-screen min-w-0 z-10'>
        <header className='lg:hidden flex items-center justify-between p-4 glass-panel m-4 mb-0'>
          <div className='flex items-center gap-3'>
            <Wallet className='text-brand-glow' size={24} />
            <h1 className='text-lg font-bold text-white'>Menu</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className='p-1 text-slate-300 hover:text-white transition-colors'
          >
            <Menu size={28} />
          </button>
        </header>

        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-32 scroll-smooth'>
          <Outlet />
        </main>
      </div>

      <FloatingAssistant />
    </div>
  )
}

export default DashboardLayout
