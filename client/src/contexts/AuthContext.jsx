import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import API_URL from '../config/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data.user)
    } catch (error) {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      const { user, token: newToken } = response.data
      setUser(user)
      setToken(newToken)
      localStorage.setItem('token', newToken)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' }
    }
  }

  const register = async (name, email, password, phone) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password, phone })
      const { user, token: newToken } = response.data
      setUser(user)
      setToken(newToken)
      localStorage.setItem('token', newToken)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' }
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
    }
  }

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    getAuthHeaders
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
