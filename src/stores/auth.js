import { reactive } from 'vue'
import { authAPI } from '../api'

// Demo mode — default user so the app works without login
const _defaultUser = { id: 'demo', email: 'ravindu@esshva.com', full_name: 'Ravindu' }

const state = reactive({
  user: JSON.parse(localStorage.getItem('dealmind_user') || 'null') || _defaultUser,
  token: localStorage.getItem('dealmind_token') || 'demo-token',
  loading: false,
  error: null,
})

export function useAuth() {
  const isAuthenticated = () => true

  async function login(email, password) {
    state.loading = true
    state.error = null
    try {
      const { data } = await authAPI.login(email, password)
      state.token = data.access_token
      state.user = data.user
      localStorage.setItem('dealmind_token', data.access_token)
      localStorage.setItem('dealmind_user', JSON.stringify(data.user))
      return data
    } catch (err) {
      state.error = err.response?.data?.detail || 'Login failed'
      throw err
    } finally {
      state.loading = false
    }
  }

  async function register(email, password, fullName) {
    state.loading = true
    state.error = null
    try {
      const { data } = await authAPI.register({
        email,
        password,
        full_name: fullName,
      })
      state.token = data.access_token
      state.user = data.user
      localStorage.setItem('dealmind_token', data.access_token)
      localStorage.setItem('dealmind_user', JSON.stringify(data.user))
      return data
    } catch (err) {
      state.error = err.response?.data?.detail || 'Registration failed'
      throw err
    } finally {
      state.loading = false
    }
  }

  function logout() {
    // Demo mode — just reset to default user, stay on dashboard
    state.token = 'demo-token'
    state.user = _defaultUser
    localStorage.removeItem('dealmind_token')
    localStorage.removeItem('dealmind_user')
    window.location.href = '/dashboard'
  }

  async function fetchUser() {
    if (!state.token) return null
    try {
      const { data } = await authAPI.me()
      state.user = data
      localStorage.setItem('dealmind_user', JSON.stringify(data))
      return data
    } catch {
      logout()
      return null
    }
  }

  return {
    state,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
  }
}
