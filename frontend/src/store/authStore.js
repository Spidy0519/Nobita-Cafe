/**
 * Nobita Café — Auth Store (Zustand)
 */
import { create } from 'zustand'
import { authApi } from '@/api'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Initialize from localStorage
  init: () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      set({ isAuthenticated: true })
      get().fetchProfile()
    }
  },

  // Fetch user profile
  fetchProfile: async () => {
    try {
      const res = await authApi.getProfile()
      set({ user: res.data, isAuthenticated: true })
    } catch (err) {
      set({ user: null, isAuthenticated: false })
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  },

  // Login with OTP
  login: async (phone, otp, name = '') => {
    set({ isLoading: true, error: null })
    try {
      const res = await authApi.verifyOTP(phone, otp, name)
      const { tokens, user, is_new_user } = res.data
      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      set({ user, isAuthenticated: true, isLoading: false })
      return { success: true, is_new_user }
    } catch (err) {
      const error = err.response?.data?.error || 'Login failed'
      set({ error, isLoading: false })
      return { success: false, error }
    }
  },

  // Send OTP
  sendOTP: async (phone) => {
    set({ isLoading: true, error: null })
    try {
      await authApi.sendOTP(phone)
      set({ isLoading: false })
      return { success: true }
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to send OTP'
      set({ error, isLoading: false })
      return { success: false, error }
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      const res = await authApi.updateProfile(data)
      set({ user: res.data })
      return { success: true }
    } catch (err) {
      return { success: false }
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, isAuthenticated: false })
  },
}))

export default useAuthStore
