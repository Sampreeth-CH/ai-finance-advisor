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

  // --- Separate AI State ---
  aiInsight: null,
  insightLoading: false,

  // --- NEW: Global Preference States ---
  language: localStorage.getItem('ai_finance_lang') || 'English',
  currency: localStorage.getItem('ai_finance_currency') || 'INR',

  // --- NEW: Actions to update preferences globally ---
  setLanguage: (lang) => {
    localStorage.setItem('ai_finance_lang', lang)
    set({ language: lang })
  },

  setCurrency: (curr) => {
    localStorage.setItem('ai_finance_currency', curr)
    set({ currency: curr })
  },

  // --- NEW: Helper function to format money anywhere in the app ---
  formatCurrency: (amount) => {
    if (amount === undefined || amount === null) return ''
    const { currency } = get()
    const symbols = { INR: '₹', USD: '$', EUR: '€' }
    const sym = symbols[currency] || '₹'
    return `${sym}${Number(amount).toLocaleString()}`
  },

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
      // --- BULLETPROOF ERROR HANDLING ---
      let errorMessage = 'Invalid email or password. Please try again.'

      // Safely dig into the error response
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail

        if (typeof detail === 'string') {
          // It's a standard error string
          errorMessage = detail
        } else if (Array.isArray(detail)) {
          // It's a FastAPI 422 Validation Error (Array of objects)
          errorMessage =
            detail[0]?.msg || 'Validation Error: Check your input format.'
        } else {
          // It's some other weird object format, safely stringify it
          try {
            errorMessage = JSON.stringify(detail)
          } catch (e) {
            errorMessage = 'An unknown error occurred.'
          }
        }
      } else if (err.message) {
        // Network errors (e.g., Server down)
        errorMessage = err.message
      }

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
        // Apply similar safe string conversion for signup
        errorMsg =
          typeof err.response.data.detail === 'string'
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail)
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

  // --- UPDATED: Dedicated function for the slow AI that passes the Language ---
  fetchInsights: async () => {
    set({ insightLoading: true })
    try {
      // Fetch the current language from the store, default to English
      const currentLang = get().language || 'English'

      // Pass the language as a query parameter to FastAPI
      const res = await api.get(`/dashboard/insights/?language=${currentLang}`)

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

  // --- NEW: Delete a single transaction ---
  deleteTransaction: async (transactionId) => {
    try {
      await api.delete(`/transactions/${transactionId}`)

      // 1. Instantly remove it from the local table so the UI feels blazing fast
      set((state) => ({
        transactions: state.transactions.filter(
          (tx) => tx.id !== transactionId,
        ),
      }))

      // 2. Re-fetch the dashboard charts quietly in the background so the math updates!
      get().fetchDashboard()

      return true
    } catch (err) {
      console.error('Failed to delete transaction:', err)
      return false
    }
  },
}))
