/**
 * Nobita Café — Axios Client with JWT interceptor
 */
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 & auto-refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh/`, {
            refresh: refreshToken,
          })
          const { access, refresh } = res.data
          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)
          originalRequest.headers.Authorization = `Bearer ${access}`
          return axiosClient(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient
