import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import SettingsPage from './pages/SettingsPage'
import WealthPage from './pages/WealthPage'
import SplitsPage from './pages/SplitsPage'
import AdvisorPage from './pages/AdvisorPage'
// --- NEW: Profile Page Import ---
import ProfilePage from './pages/ProfilePage'

import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAppStore } from './store/appStore'
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
          <Route path='wealth' element={<WealthPage />} />
          <Route path='splits' element={<SplitsPage />} />
          <Route path='advisor' element={<AdvisorPage />} />
          {/* --- NEW: Profile Route --- */}
          <Route path='profile' element={<ProfilePage />} />

          <Route path='settings' element={<SettingsPage />} />
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>

      {token && <VoiceChatBot />}
    </BrowserRouter>
  )
}

export default App
