import { useState, useEffect } from 'react'
import { useCart } from '../App'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Search, Plus, ChefHat, Filter, Heart, Info } from 'lucide-react'
import axios from 'axios'
import ItemDetailModal from './ItemDetailModal'
import API_URL from '../config/api'

export default function Menu({ menuItems, restaurant }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular') // popular, price-low, price-high, rating, name
  const [dietaryFilter, setDietaryFilter] = useState('all') // all, vegetarian, vegan
  const { addToCart } = useCart()
  const { user, getAuthHeaders, isAuthenticated } = useAuth()
  const { success, error } = useToast()
  const [selectedItems, setSelectedItems] = useState({})
  const [favorites, setFavorites] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites()
    }
  }, [isAuthenticated, getAuthHeaders])

  const loadFavorites = async () => {
    try {
      const response = await axios.get(`${API_URL}/favorites`, {
        headers: getAuthHeaders()
      })
      setFavorites(response.data.map(item => item.id))
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const toggleFavorite = async (itemId) => {
    if (!isAuthenticated) {
      error('Please sign in to add favorites')
      return
    }

    try {
      const isFavorite = favorites.includes(itemId)
      if (isFavorite) {
        await axios.delete(`${API_URL}/favorites/${itemId}`, {
          headers: getAuthHeaders()
        })
        setFavorites(prev => prev.filter(id => id !== itemId))
        success('Removed from favorites')
      } else {
        await axios.post(`${API_URL}/favorites/${itemId}`, {}, {
          headers: getAuthHeaders()
        })
        setFavorites(prev => [...prev, itemId])
        success('Added to favorites')
      }
    } catch (err) {
      error('Failed to update favorites')
      console.error('Error toggling favorite:', err)
    }
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setIsDetailModalOpen(true)
  }

  const categories = ['all', 'pizza', 'burger', 'asian', 'salad', 'dessert']

  const filteredAndSortedItems = menuItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesDietary = dietaryFilter === 'all' ||
        (item.dietary && item.dietary.includes(dietaryFilter))
      const isAvailable = item.isAvailable !== false
      
      return matchesSearch && matchesCategory && matchesDietary && isAvailable
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'popular':
        default:
          return (b.reviewCount || 0) - (a.reviewCount || 0)
      }
    })

  const handleAddToCart = (item) => {
    const itemKey = item.id
    const selection = selectedItems[itemKey] || { quantity: 1, toppings: [] }
    addToCart(item, selection.quantity, selection.toppings)
    success(`${item.name} added to cart!`)
    
    setSelectedItems(prev => ({
      ...prev,
      [itemKey]: { quantity: 1, toppings: [] }
    }))
  }

  const updateSelection = (itemId, field, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { quantity: 1, toppings: [] }),
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-4xl font-black text-gray-900">Our Menu</h2>
            <p className="text-gray-600">Delicious dishes waiting for you</p>
            {restaurant && (
              <div className="mt-2 text-sm text-gray-500">
                Minimum order: <span className="font-semibold text-purple-600">${restaurant.minOrder.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for dishes, ingredients, or cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Category Filter and Sorting */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <Filter className="w-5 h-5 text-gray-400" />
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <select
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Diets</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        {filteredAndSortedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-700 font-semibold mb-2">No dishes found</p>
            <p className="text-gray-500">Try searching for something else</p>
          </div>
        ) : (
          filteredAndSortedItems.map(item => (
            <MenuItem
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
              selection={selectedItems[item.id] || { quantity: 1, toppings: [] }}
              onSelectionChange={(field, value) => updateSelection(item.id, field, value)}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onItemClick={() => handleItemClick(item)}
            />
          ))
        )}
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onToggleFavorite={toggleFavorite}
        isFavorite={selectedItem ? favorites.includes(selectedItem.id) : false}
      />
    </div>
  )
}

function MenuItem({ item, onAddToCart, selection, onSelectionChange, isFavorite, onToggleFavorite, onItemClick }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 card-hover group relative">
      <button
        onClick={onToggleFavorite}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all z-10 ${
          isFavorite 
            ? 'bg-red-500 text-white' 
            : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
        }`}
      >
        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
      </button>
      
      <button
        onClick={onItemClick}
        className="absolute top-4 left-4 p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors z-10"
        title="View Details"
      >
        <Info className="w-5 h-5" />
      </button>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Item Image */}
        <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 group-hover:scale-110 transition-transform duration-300">
          {item.image && item.image.startsWith('http') ? (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">🍽️</div>'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {item.image || '🍽️'}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-black text-gray-900">{item.name}</h3>
                {item.rating > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-semibold">
                    ⭐ {item.rating.toFixed(1)}
                    {item.reviewCount > 0 && <span className="text-gray-500">({item.reviewCount})</span>}
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-3">{item.description}</p>
            </div>
            <div className="text-right ml-4">
              <div className="text-3xl font-black gradient-text">${item.price.toFixed(2)}</div>
              <div className="text-sm text-gray-500">per item</div>
            </div>
          </div>

          {/* Toppings */}
          {item.toppings && item.toppings.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-700 mb-2 block">Customize:</label>
              <select
                multiple
                value={selection.toppings}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  onSelectionChange('toppings', selected)
                }}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                size={Math.min(item.toppings.length, 3)}
              >
                {item.toppings.map(topping => (
                  <option key={topping} value={topping}>
                    {topping}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity and Add Button */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2 border-2 border-gray-200">
              <button
                onClick={() => onSelectionChange('quantity', Math.max(1, selection.quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white text-gray-700 font-bold hover:bg-purple-100 hover:text-purple-600 transition-colors"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-gray-900">{selection.quantity}</span>
              <button
                onClick={() => onSelectionChange('quantity', Math.min(10, selection.quantity + 1))}
                className="w-8 h-8 rounded-lg bg-white text-gray-700 font-bold hover:bg-purple-100 hover:text-purple-600 transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={() => onAddToCart(item)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}