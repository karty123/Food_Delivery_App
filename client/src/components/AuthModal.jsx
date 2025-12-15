import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { X, Mail, Lock, User, Phone } from 'lucide-react'

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const { success } = useToast()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let result
      if (mode === 'login') {
        result = await login(formData.email, formData.password)
      } else {
        result = await register(formData.name, formData.email, formData.password, formData.phone)
      }

      if (result.success) {
        success(mode === 'login' ? 'Welcome back!' : 'Account created successfully!')
        onClose()
        setFormData({ name: '', email: '', password: '', phone: '' })
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Sign in to continue ordering' 
              : 'Join us and start ordering delicious food'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <User className="w-5 h-5 text-purple-600" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
              <Mail className="w-5 h-5 text-purple-600" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Phone className="w-5 h-5 text-purple-600" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
              <Lock className="w-5 h-5 text-purple-600" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
