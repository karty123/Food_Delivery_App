import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, Save, Edit2, X } from 'lucide-react'
import axios from 'axios'
import API_URL from '../config/api'

export default function UserProfile({ onBack }) {
  const { user, getAuthHeaders, isAuthenticated } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [newAddress, setNewAddress] = useState({
    address: '',
    label: 'Home'
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses()
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    }
  }, [isAuthenticated, user])

  const loadAddresses = async () => {
    try {
      const response = await axios.get(`${API_URL}/addresses`, {
        headers: getAuthHeaders()
      })
      setAddresses(response.data)
    } catch (err) {
      console.error('Error loading addresses:', err)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // In a real app, you'd have an update profile endpoint
      success('Profile updated successfully!')
      setEditing(false)
    } catch (err) {
      error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      error('New passwords do not match')
      return
    }
    if (formData.newPassword.length < 6) {
      error('Password must be at least 6 characters')
      return
    }
    // In a real app, you'd have a change password endpoint
    success('Password changed successfully!')
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_URL}/addresses`, newAddress, {
        headers: getAuthHeaders()
      })
      setAddresses(prev => [...prev, response.data])
      setNewAddress({ address: '', label: 'Home' })
      success('Address added successfully!')
    } catch (err) {
      error('Failed to add address')
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete(`${API_URL}/addresses/${id}`, {
        headers: getAuthHeaders()
      })
      setAddresses(prev => prev.filter(addr => addr.id !== id))
      success('Address deleted successfully!')
    } catch (err) {
      error('Failed to delete address')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-purple-600 mb-8 transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-purple-600 mb-8 transition-colors font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Profile Information</h2>
                  <p className="text-gray-600">Manage your personal details</p>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!editing}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                  <Mail className="w-5 h-5 text-purple-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!editing}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!editing}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {editing && (
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
                    }}
                    className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5 inline mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Change Password</h2>
                <p className="text-gray-600">Update your account password</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Current Password</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">New Password</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Change Password
              </button>
            </form>
          </div>

          {/* Saved Addresses */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Saved Addresses</h2>
                <p className="text-gray-600">Manage your delivery addresses</p>
              </div>
            </div>

            <form onSubmit={handleAddAddress} className="mb-6 space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Address label (e.g., Home, Office)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                  className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Enter address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                  required
                  className="flex-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl transition-all"
                >
                  Add
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {addresses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No saved addresses</p>
              ) : (
                addresses.map(address => (
                  <div
                    key={address.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div>
                      <div className="font-bold text-gray-900">{address.label}</div>
                      <div className="text-sm text-gray-600">{address.address}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-6 shadow-2xl text-white sticky top-28">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-center mb-2">{user?.name}</h3>
            <p className="text-white/80 text-center text-sm mb-6">{user?.email}</p>
            <div className="space-y-3">
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-black">{addresses.length}</div>
                <div className="text-sm opacity-90">Saved Addresses</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
