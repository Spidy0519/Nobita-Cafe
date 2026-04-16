/**
 * Nobita Café — Plain Axios Client
 */
import axios from 'axios'

function normalizeApiBase(rawBase) {
  const fallback = import.meta.env.PROD
    ? 'https://nobita-cafe.onrender.com/api'
    : 'http://localhost:8000/api'
  if (!rawBase) return fallback

  const cleaned = String(rawBase).trim().replace(/\/+$/, '')
  if (!cleaned) return fallback

  try {
    const parsed = new URL(cleaned)
    const path = parsed.pathname.replace(/\/+$/, '')
    if (!path || path === '/') {
      parsed.pathname = '/api'
      return parsed.toString().replace(/\/+$/, '')
    }
    return cleaned
  } catch {
    return cleaned
  }
}

const API_BASE = normalizeApiBase(
  import.meta.env.PROD
    ? (import.meta.env.VITE_API_BASE_URL_PROD || import.meta.env.VITE_API_BASE_URL)
    : (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL_PROD)
)

const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default axiosClient
