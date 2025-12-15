import { useState } from 'react'
import { ArrowLeft, Star, Clock, MapPin, Phone, Search, Filter } from 'lucide-react'

export default function RestaurantList({ restaurants, onSelectRestaurant, onBack }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('all')
  const [sortBy, setSortBy] = useState('rating') // rating, deliveryTime, name

  const cuisines = ['all', ...new Set(restaurants.map(r => r.cuisine.toLowerCase()))]

  const filteredAndSorted = restaurants
    .filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCuisine = selectedCuisine === 'all' || 
        restaurant.cuisine.toLowerCase() === selectedCuisine

      return matchesSearch && matchesCuisine && restaurant.isOpen
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'deliveryTime':
          return parseInt(a.deliveryTime) - parseInt(b.deliveryTime)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-purple-600 mb-6 transition-colors font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900">Choose Restaurant</h2>
            <p className="text-gray-600">Select a restaurant to browse their menu</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search restaurants by name, cuisine, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex gap-2 flex-wrap">
              {cuisines.map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                    selectedCuisine === cuisine
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-auto px-4 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="rating">Sort by Rating</option>
              <option value="deliveryTime">Sort by Delivery Time</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Restaurants Grid */}
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-700 font-semibold mb-2">No restaurants found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSorted.map(restaurant => (
              <div
                key={restaurant.id}
                onClick={() => onSelectRestaurant(restaurant)}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:border-purple-300 transition-all card-hover cursor-pointer group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 group-hover:scale-110 transition-transform flex-shrink-0">
                    {restaurant.image && restaurant.image.startsWith('http') ? (
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">🍽️</div>'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {restaurant.image || '🍽️'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 mb-1">{restaurant.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900">{restaurant.rating}</span>
                      <span className="text-sm text-gray-500">({restaurant.cuisine})</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{restaurant.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    💰 Min order: ${restaurant.minOrder}
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  View Menu
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
