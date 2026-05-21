import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import SettingsPage from './pages/SettingsPage'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAppStore } from './store/appStore'

// --- NEW: Import the Voice Chat Bot ---
import VoiceChatBot from './components/VoiceChatBot'

function App() {
  const { token, fetchUser } = useAppStore()

  useEffect(() => {
    if (token) {
      fetchUser()
    }
  }, [token, fetchUser])

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />

        <Route
          path='/'
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to='/dashboard' replace />} />
          <Route path='dashboard' element={<DashboardPage />} />
          <Route path='transactions' element={<TransactionsPage />} />
          <Route path='settings' element={<SettingsPage />} />
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>

      {/* --- NEW: The Floating AI Assistant --- */}
      {/* It sits outside the Routes so it persists across pages, 
          but ONLY renders if the user is logged in (token exists) */}
      {token && <VoiceChatBot />}
    </BrowserRouter>
  )
}

export default App
