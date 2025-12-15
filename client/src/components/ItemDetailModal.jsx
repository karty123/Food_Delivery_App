import { useState, useEffect } from 'react'
import { X, Star, Heart, Plus, Minus, MessageSquare } from 'lucide-react'
import { useCart } from '../App'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import axios from 'axios'
import API_URL from '../config/api'

export default function ItemDetailModal({ item, isOpen, onClose, onToggleFavorite, isFavorite }) {
  const { addToCart } = useCart()
  const { isAuthenticated, getAuthHeaders } = useAuth()
  const { success, error, info } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [selectedToppings, setSelectedToppings] = useState([])
  const [reviews, setReviews] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [loadingReviews, setLoadingReviews] = useState(false)

  useEffect(() => {
    if (isOpen && item) {
      fetchReviews()
    }
    // Reset state when modal closes
    if (!isOpen) {
      setQuantity(1)
      setSelectedToppings([])
      setShowReviewForm(false)
      setReviewComment('')
      setReviewRating(5)
    }
  }, [isOpen, item])

  const fetchReviews = async () => {
    if (!item) return
    setLoadingReviews(true)
    try {
      const response = await axios.get(`${API_URL}/menu/${item.id}/reviews`)
      setReviews(response.data)
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleAddToCart = () => {
    addToCart(item, quantity, selectedToppings)
    success(`${item.name} added to cart!`, 2000)
    onClose()
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      error('Please sign in to leave a review')
      return
    }

    try {
      await axios.post(
        `${API_URL}/menu/${item.id}/review`,
        { rating: reviewRating, comment: reviewComment },
        { headers: getAuthHeaders() }
      )
      success('Review submitted successfully!')
      setShowReviewForm(false)
      setReviewComment('')
      fetchReviews()
    } catch (err) {
      error(err.response?.data?.error || 'Failed to submit review')
    }
  }

  const toggleTopping = (topping) => {
    setSelectedToppings(prev =>
      prev.includes(topping)
        ? prev.filter(t => t !== topping)
        : [...prev, topping]
    )
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Item Image/Header */}
        <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 p-8 rounded-t-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-4xl font-black text-gray-900">{item.name}</h2>
                {item.rating > 0 && (
                  <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900">{item.rating.toFixed(1)}</span>
                    {item.reviewCount > 0 && (
                      <span className="text-gray-600 text-sm">({item.reviewCount})</span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xl text-gray-600 mb-4">{item.description}</p>
            </div>
            <div className="text-right ml-6">
              <div className="text-5xl font-black gradient-text">${item.price.toFixed(2)}</div>
              <div className="text-sm text-gray-600">per item</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleFavorite(item.id)}
              className={`p-3 rounded-xl transition-all ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Add to Cart
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Toppings */}
          {item.toppings && item.toppings.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customize Your Order</h3>
              <div className="flex flex-wrap gap-2">
                {item.toppings.map((topping) => (
                  <button
                    key={topping}
                    onClick={() => toggleTopping(topping)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      selectedToppings.includes(topping)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {topping}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Reviews ({reviews.length})
              </h3>
              {isAuthenticated && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  {showReviewForm ? 'Cancel' : 'Write Review'}
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-purple-50 rounded-xl p-4 mb-4">
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-2xl"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows="3"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Share your experience..."
                  />
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Submit Review
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {loadingReviews ? (
                <div className="text-center py-8 text-gray-500">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No reviews yet. Be the first to review!
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-gray-900">{review.userName}</div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
