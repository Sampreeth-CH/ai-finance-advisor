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

  // --- NEW: Separate AI State ---
  aiInsight: null,
  insightLoading: false,

  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const payload = {
        email: email,
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
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Invalid email or password. Please try again.'

      set({
        error: errorMessage,
        loading: false,
      })
      return false
    }
  },

  signup: async (email, password, name) => {
    set({ loading: true, error: null })
    try {
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
    set({
      token: null,
      user: null,
      dashboardData: null,
      transactions: [],
      aiInsight: null,
    })
  },

  fetchUser: async () => {
    try {
      const res = await api.get('/me')
      set({ user: res.data })
    } catch (err) {
      get().logout()
    }
  },

  fetchDashboard: async () => {
    set({ loading: true })
    try {
      // 1. Instantly get the charts and numbers
      const res = await api.get('/dashboard/')
      set({ dashboardData: res.data, loading: false })

      // 2. Once the dashboard loads, tell the AI to start thinking in the background!
      get().fetchInsights()
    } catch (err) {
      set({ error: 'Failed to fetch dashboard metrics', loading: false })
    }
  },

  // --- NEW: Dedicated function for the slow AI ---
  fetchInsights: async () => {
    set({ insightLoading: true })
    try {
      const res = await api.get('/dashboard/insights/')
      set({ aiInsight: res.data.ai_advisor, insightLoading: false })
    } catch (err) {
      set({
        aiInsight: 'Could not connect to the AI right now.',
        insightLoading: false,
      })
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
