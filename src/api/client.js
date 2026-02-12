import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
})

// Request interceptor: attach JWT token and set correct Content-Type
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dealmind_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Let axios auto-detect Content-Type for FormData (multipart/form-data)
  // Only set JSON content-type for non-FormData requests
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
  }
  return config
})

// Response interceptor: handle 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dealmind_token')
      localStorage.removeItem('dealmind_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
