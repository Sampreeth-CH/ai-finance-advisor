import { create } from 'zustand'
import api from '../services/api'

export const useAppStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  dashboardData: null,
  transactions: [],
  loading: false,
  error: null,
  isChatOpen: false,

  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      // Reverted back to standard JSON dictionary because your specific backend expects it!
      const payload = {
        email: email, // Depending on your backend, this might need to be 'username: email'
        password: password,
      }

      const res = await api.post('/auth/login', payload)

      const { access_token } = res.data
      localStorage.setItem('token', access_token)
      set({ token: access_token })
      await get().fetchUser()
      set({ loading: false })
      return true
    } catch (err) {
      set({
        error: err.response?.data?.detail || 'Login failed',
        loading: false,
      })
      return false
    }
  },

  signup: async (email, password, name) => {
    set({ loading: true, error: null })
    try {
      // FIX 2: Match your backend Pydantic schema exactly (full_name)
      const payload = {
        email: email,
        password: password,
        full_name: name,
      }

      await api.post('/auth/signup', payload)
      set({ loading: false })
      return true
    } catch (err) {
      let errorMsg = 'Signup failed'
      if (err.response?.status === 422) {
        errorMsg = err.response.data.detail[0]?.msg || 'Validation Error'
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail
      }
      set({ error: errorMsg, loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, dashboardData: null, transactions: [] })
  },

  fetchUser: async () => {
    try {
      // FIX 3: Point to /me instead of /auth/me
      const res = await api.get('/me')
      set({ user: res.data })
    } catch (err) {
      get().logout()
    }
  },

  fetchDashboard: async () => {
    set({ loading: true })
    try {
      const res = await api.get('/dashboard/')
      set({ dashboardData: res.data, loading: false })
    } catch (err) {
      set({ error: 'Failed to fetch dashboard metrics', loading: false })
    }
  },

  fetchTransactions: async () => {
    try {
      const res = await api.get('/transactions/')
      set({ transactions: res.data })
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    }
  },
}))
