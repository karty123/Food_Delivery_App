import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../App'
import { useToast } from '../contexts/ToastContext'
import { ArrowLeft, Heart, Plus, Trash2, Info } from 'lucide-react'
import axios from 'axios'
import ItemDetailModal from './ItemDetailModal'
import API_URL from '../config/api'

export default function FavoritesPage({ onBack }) {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { success, error } = useToast()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, getAuthHeaders])

  const loadFavorites = async () => {
    try {
      const response = await axios.get(`${API_URL}/favorites`, {
        headers: getAuthHeaders()
      })
      setFavorites(response.data)
    } catch (err) {
      console.error('Error loading favorites:', err)
      error('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/favorites/${itemId}`, {
        headers: getAuthHeaders()
      })
      setFavorites(prev => prev.filter(item => item.id !== itemId))
      success('Removed from favorites')
    } catch (err) {
      error('Failed to remove from favorites')
    }
  }

  const handleAddToCart = (item) => {
    addToCart(item, 1, [])
    success(`${item.name} added to cart!`)
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setIsDetailModalOpen(true)
  }

  const toggleFavorite = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/favorites/${itemId}`, {
        headers: getAuthHeaders()
      })
      setFavorites(prev => prev.filter(item => item.id !== itemId))
      success('Removed from favorites')
    } catch (err) {
      error('Failed to update favorites')
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
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to view your favorite items</p>
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

      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Heart className="w-7 h-7 text-white fill-current" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900">My Favorites</h2>
            <p className="text-gray-600">Items you've saved for later</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading favorites...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No favorites yet</p>
            <p className="text-gray-500">Start adding items to your favorites!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(item => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:border-purple-300 transition-all card-hover relative group"
              >
                <button
                  onClick={() => handleRemoveFavorite(item.id)}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="text-6xl mb-4 text-center">{item.image || '🍽️'}</div>
                
                <h3 className="text-xl font-black text-gray-900 mb-2">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                
                {item.rating > 0 && (
                  <div className="flex items-center gap-1 mb-4">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-semibold text-gray-900">{item.rating.toFixed(1)}</span>
                    {item.reviewCount > 0 && (
                      <span className="text-gray-500 text-sm">({item.reviewCount})</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-black gradient-text">
                    ${item.price.toFixed(2)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleItemClick(item)}
                      className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                      title="View Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onToggleFavorite={toggleFavorite}
        isFavorite={selectedItem ? favorites.some(f => f.id === selectedItem.id) : false}
      />
    </div>
  )
}
