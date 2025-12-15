import { ShoppingCart, Menu as MenuIcon, Home, User, LogOut, History, Heart, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Header({ cartItemCount, onCartClick, currentView, onNavigate, onLoginClick, onRegisterClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  const navigation = [
    { name: 'Home', view: 'landing' },
    { name: 'Menu', view: 'menu' }
  ]

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    if (currentView === 'history' || currentView === 'profile' || currentView === 'favorites') {
      onNavigate('landing')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
              🍽️
            </div>
            <div>
              <div className="text-2xl font-black gradient-text">FoodDeliver</div>
              <div className="text-xs text-gray-500 -mt-1">Premium Food Delivery</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`font-semibold transition-colors ${
                  currentView === item.view
                    ? 'text-purple-600'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Cart & Auth Buttons */}
          <div className="flex items-center gap-4">
            {currentView !== 'landing' && (
              <button
                onClick={onCartClick}
                className="relative flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors"
                >
                  <User className="w-5 h-5 text-gray-700" />
                  <span className="hidden sm:inline font-semibold text-gray-700">{user?.name}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
                    <button
                      onClick={() => {
                        onNavigate('favorites')
                        setUserMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <Heart className="w-4 h-4" />
                      My Favorites
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('history')
                        setUserMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <History className="w-4 h-4" />
                      Order History
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('profile')
                        setUserMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <UserCircle className="w-4 h-4" />
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onRegisterClick}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MenuIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navigation.map((item) => (
                <button
                  key={item.view}
                  onClick={() => {
                    onNavigate(item.view)
                    setMobileMenuOpen(false)
                  }}
                  className={`text-left font-semibold py-2 px-4 rounded-lg transition-colors ${
                    currentView === item.view
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}