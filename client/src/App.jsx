import { useState, useEffect, createContext, useContext } from 'react'
import axios from 'axios'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import Menu from './components/Menu'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import OrderTracking from './components/OrderTracking'
import OrderHistory from './components/OrderHistory'
import FavoritesPage from './components/FavoritesPage'
import RestaurantList from './components/RestaurantList'
import UserProfile from './components/UserProfile'
import AuthModal from './components/AuthModal'
import API_URL from './config/api'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

function App() {
  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [currentView, setCurrentView] = useState('landing') // landing, restaurants, menu, checkout, tracking, history, favorites, profile
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')

  useEffect(() => {
    fetchRestaurants()
    loadCartFromStorage()
    
    // Initialize from URL hash if present
    const hash = window.location.hash.slice(1)
    const validViews = ['landing', 'restaurants', 'menu', 'checkout', 'tracking', 'history', 'favorites', 'profile']
    if (hash && validViews.includes(hash)) {
      setCurrentView(hash)
      
      // Restore restaurant selection for menu view
      if (hash === 'menu') {
        const storedRestaurantId = sessionStorage.getItem('selectedRestaurantId')
        if (storedRestaurantId) {
          // We'll restore it after restaurants are loaded
        }
      }
    } else {
      // Set initial hash
      window.location.hash = currentView
    }
  }, [])

  useEffect(() => {
    // Restore restaurant when restaurants are loaded and we're on menu view
    if (restaurants.length > 0 && currentView === 'menu' && !selectedRestaurant) {
      const storedRestaurantId = sessionStorage.getItem('selectedRestaurantId')
      if (storedRestaurantId) {
        const restaurant = restaurants.find(r => r.id === parseInt(storedRestaurantId))
        if (restaurant) {
          setSelectedRestaurant(restaurant)
        }
      }
    }
  }, [restaurants, currentView])

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant.id)
    }
  }, [selectedRestaurant])

  // Sync currentView with URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash && hash !== currentView) {
      const validViews = ['landing', 'restaurants', 'menu', 'checkout', 'tracking', 'history', 'favorites', 'profile']
      if (validViews.includes(hash)) {
        // Don't update hash here to avoid loop, just update view
        // This handles browser back/forward
      }
    } else if (!hash) {
      window.location.hash = currentView
    }
  }, [currentView])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'landing'
      const validViews = ['landing', 'restaurants', 'menu', 'checkout', 'tracking', 'history', 'favorites', 'profile']
      if (validViews.includes(hash) && hash !== currentView) {
        setCurrentView(hash)
        
        // Restore restaurant selection for menu view
        if (hash === 'menu') {
          const storedRestaurantId = sessionStorage.getItem('selectedRestaurantId')
          if (storedRestaurantId && restaurants.length > 0) {
            const restaurant = restaurants.find(r => r.id === parseInt(storedRestaurantId))
            if (restaurant) {
              setSelectedRestaurant(restaurant)
            }
          }
        } else if (hash !== 'menu') {
          // Clear restaurant when leaving menu
          // Don't clear on checkout/tracking as user might go back
          if (hash === 'landing' || hash === 'restaurants') {
            setSelectedRestaurant(null)
            sessionStorage.removeItem('selectedRestaurantId')
          }
        }
      }
    }
    
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [currentView, restaurants])

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${API_URL}/restaurants`)
      setRestaurants(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
      setLoading(false)
    }
  }

  const fetchMenuItems = async (restaurantId) => {
    try {
      const response = await axios.get(`${API_URL}/menu?restaurantId=${restaurantId}`)
      setMenuItems(response.data)
    } catch (error) {
      console.error('Error fetching menu:', error)
    }
  }

  // Navigation helper that updates both state and URL hash
  const navigateToView = (view) => {
    // If trying to go to menu without a restaurant, redirect to restaurants first
    if (view === 'menu' && !selectedRestaurant) {
      setCurrentView('restaurants')
      window.location.hash = 'restaurants'
      return
    }
    
    setCurrentView(view)
    window.location.hash = view
  }

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant)
    sessionStorage.setItem('selectedRestaurantId', restaurant.id.toString())
    navigateToView('menu')
    // Clear cart when switching restaurants
    clearCart()
  }

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const saveCartToStorage = (cartItems) => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }

  const addToCart = (item, quantity = 1, selectedToppings = []) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      quantity,
      toppings: selectedToppings,
      image: item.image
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        ci => ci.id === item.id && 
        JSON.stringify(ci.toppings.sort()) === JSON.stringify(selectedToppings.sort())
      )

      let newCart
      if (existingIndex > -1) {
        newCart = [...prevCart]
        newCart[existingIndex].quantity += quantity
      } else {
        newCart = [...prevCart, cartItem]
      }
      saveCartToStorage(newCart)
      return newCart
    })
  }

  const removeFromCart = (index) => {
    setCart(prevCart => {
      const newCart = prevCart.filter((_, i) => i !== index)
      saveCartToStorage(newCart)
      return newCart
    })
  }

  const updateCartItemQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index)
      return
    }
    setCart(prevCart => {
      const newCart = [...prevCart]
      newCart[index].quantity = quantity
      saveCartToStorage(newCart)
      return newCart
    })
  }

  const clearCart = () => {
    setCart([])
    saveCartToStorage([])
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handlePlaceOrder = async (orderData, userId = null) => {
    try {
      const order = {
        items: cart,
        total: orderData.total || getCartTotal(), // Use passed total (with discount) or fallback
        userId,
        restaurantId: selectedRestaurant?.id || null,
        ...orderData
      }

      const response = await axios.post(`${API_URL}/orders`, order)
      setCurrentOrder(response.data)
      clearCart()
      navigateToView('tracking')
      return response.data
    } catch (error) {
      console.error('Error placing order:', error)
      throw error
    }
  }

  const handleNewOrder = () => {
    if (selectedRestaurant) {
      navigateToView('menu')
    } else {
      navigateToView('restaurants')
    }
    setCurrentOrder(null)
  }

  const cartValue = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading delicious menu...</div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <CartContext.Provider value={cartValue}>
          <div className="min-h-screen">
          <Header 
            cartItemCount={getCartItemCount()} 
            onCartClick={() => {
              if (selectedRestaurant) {
                navigateToView('menu')
              } else {
                navigateToView('restaurants')
              }
            }}
            currentView={currentView}
            onNavigate={navigateToView}
            onLoginClick={() => {
              setAuthModalMode('login')
              setAuthModalOpen(true)
            }}
            onRegisterClick={() => {
              setAuthModalMode('register')
              setAuthModalOpen(true)
            }}
          />
        
        <main>
          {currentView === 'landing' && (
            <LandingPage onGetStarted={() => navigateToView('restaurants')} />
          )}

          {currentView === 'restaurants' && (
            <div className="container mx-auto px-4 py-8">
              <RestaurantList 
                restaurants={restaurants}
                onSelectRestaurant={handleRestaurantSelect}
                onBack={() => navigateToView('landing')}
              />
            </div>
          )}

          {currentView === 'menu' && (
            selectedRestaurant ? (
              <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setSelectedRestaurant(null)
                      sessionStorage.removeItem('selectedRestaurantId')
                      navigateToView('restaurants')
                    }}
                    className="flex items-center gap-2 text-gray-700 hover:text-purple-600 mb-4 transition-colors font-semibold"
                  >
                    ← Back to Restaurants
                  </button>
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0">
                        {selectedRestaurant.image && selectedRestaurant.image.startsWith('http') ? (
                          <img 
                            src={selectedRestaurant.image} 
                            alt={selectedRestaurant.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">🍽️</div>'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            {selectedRestaurant.image || '🍽️'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-gray-900">{selectedRestaurant.name}</h2>
                        <p className="text-gray-600">{selectedRestaurant.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-yellow-500">⭐ {selectedRestaurant.rating}</span>
                          <span className="text-gray-500">⏱️ {selectedRestaurant.deliveryTime}</span>
                          <span className="text-gray-500">📍 {selectedRestaurant.cuisine}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <Menu menuItems={menuItems} restaurant={selectedRestaurant} />
                  </div>
                  <div className="lg:col-span-1">
                    <Cart onCheckout={() => navigateToView('checkout')} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border border-gray-100 max-w-2xl mx-auto">
                  <div className="text-6xl mb-6">🍽️</div>
                  <h2 className="text-3xl font-black text-gray-900 mb-4">Select a Restaurant First</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Please choose a restaurant to view their menu and start ordering delicious food!
                  </p>
                  <button
                    onClick={() => navigateToView('restaurants')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Browse Restaurants
                  </button>
                </div>
              </div>
            )
          )}

          {currentView === 'checkout' && (
            <div className="container mx-auto px-4 py-8">
              <Checkout 
                onBack={() => navigateToView('menu')}
                onOrderPlaced={handlePlaceOrder}
              />
            </div>
          )}

          {currentView === 'tracking' && (
            <div className="container mx-auto px-4 py-8">
              <OrderTracking 
                order={currentOrder}
                onNewOrder={handleNewOrder}
              />
            </div>
          )}

          {currentView === 'history' && (
            <div className="container mx-auto px-4 py-8">
              <OrderHistory onBack={() => {
                if (selectedRestaurant) {
                  navigateToView('menu')
                } else {
                  navigateToView('restaurants')
                }
              }} />
            </div>
          )}

          {currentView === 'favorites' && (
            <div className="container mx-auto px-4 py-8">
              <FavoritesPage onBack={() => {
                if (selectedRestaurant) {
                  navigateToView('menu')
                } else {
                  navigateToView('restaurants')
                }
              }} />
            </div>
          )}

          {currentView === 'profile' && (
            <div className="container mx-auto px-4 py-8">
              <UserProfile onBack={() => {
                if (selectedRestaurant) {
                  navigateToView('menu')
                } else {
                  navigateToView('restaurants')
                }
              }} />
            </div>
          )}
        </main>

        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
        />
          </div>
        </CartContext.Provider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
