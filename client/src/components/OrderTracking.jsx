import { useState, useEffect } from 'react'
import { CheckCircle2, Package, Truck, Home, Clock, ArrowLeft, Sparkles, MapPin, Phone, User, RefreshCw } from 'lucide-react'
import axios from 'axios'
import API_URL from '../config/api'

const DELIVERY_STAGES = [
  { id: 1, name: 'Order Confirmed', icon: CheckCircle2, progress: 25, color: 'from-blue-500 to-cyan-500' },
  { id: 2, name: 'Preparing', icon: Package, progress: 50, color: 'from-purple-500 to-pink-500' },
  { id: 3, name: 'Out for Delivery', icon: Truck, progress: 75, color: 'from-orange-500 to-red-500' },
  { id: 4, name: 'Delivered', icon: Home, progress: 100, color: 'from-green-500 to-emerald-500' }
]

export default function OrderTracking({ order, onNewOrder }) {
  const [currentStage, setCurrentStage] = useState(order?.stage || 1)
  const [trackingData, setTrackingData] = useState(null)
  const [stageTimestamps, setStageTimestamps] = useState({})
  const [timeElapsed, setTimeElapsed] = useState('')

  useEffect(() => {
    if (!order?.id) return
    
    fetchOrderStatus()
    const interval = setInterval(fetchOrderStatus, 3000) // Poll every 3 seconds for real-time updates
    
    return () => clearInterval(interval)
  }, [order?.id])

  useEffect(() => {
    if (order?.createdAt) {
      const updateTimeElapsed = () => {
        const now = new Date()
        const created = new Date(order.createdAt)
        const diff = Math.floor((now - created) / 1000) // seconds
        
        const minutes = Math.floor(diff / 60)
        const seconds = diff % 60
        
        if (minutes > 0) {
          setTimeElapsed(`${minutes}m ${seconds}s`)
        } else {
          setTimeElapsed(`${seconds}s`)
        }
      }
      
      updateTimeElapsed()
      const interval = setInterval(updateTimeElapsed, 1000)
      return () => clearInterval(interval)
    }
  }, [order?.createdAt])

  const fetchOrderStatus = async () => {
    if (!order?.id) return
    
    try {
      const response = await axios.get(`${API_URL}/orders/${order.id}`)
      const newData = response.data
      setTrackingData(newData)
      
      // Update stage with animation
      if (newData.stage && newData.stage !== currentStage) {
        setCurrentStage(newData.stage)
        
        // Record timestamp when stage changes
        setStageTimestamps(prev => ({
          ...prev,
          [newData.stage]: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.error('Error fetching order status:', error)
    }
  }

  const currentStageData = DELIVERY_STAGES.find(stage => stage.id === currentStage) || DELIVERY_STAGES[0]
  
  const getStageTime = (stageId) => {
    if (stageId === 1) return order?.createdAt ? new Date(order.createdAt).toLocaleTimeString() : null
    return stageTimestamps[stageId] ? new Date(stageTimestamps[stageId]).toLocaleTimeString() : null
  }

  if (!order) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">No Order to Track</h2>
          <p className="text-gray-600 mb-6">You don't have an active order to track.</p>
          <button
            onClick={onNewOrder}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Place New Order
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <button
          onClick={onNewOrder}
          className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Place New Order
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrderStatus}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-semibold px-4 py-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live tracking • Auto-updates every 3s</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 mb-8 shadow-2xl text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="text-sm font-semibold opacity-90">Order Tracking • Live Updates</span>
            </div>
            <h2 className="text-4xl font-black mb-1">Order #{order?.id?.slice(0, 8).toUpperCase()}</h2>
            <p className="text-white/80">Track your delivery in real-time</p>
            {timeElapsed && (
              <p className="text-white/70 text-sm mt-2">⏱️ Time elapsed: {timeElapsed}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-black mb-1">
              ${typeof order?.total === 'number' ? order.total.toFixed(2) : parseFloat(order?.total || 0).toFixed(2)}
            </div>
            <div className="text-sm opacity-90">Total Amount</div>
            {trackingData?.estimatedTime && (
              <div className="text-sm opacity-90 mt-2">
                📍 ETA: {trackingData.estimatedTime}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-8">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-2 bg-gray-200 rounded-full"></div>
          <div 
            className={`absolute top-8 left-0 h-2 bg-gradient-to-r ${currentStageData.color} rounded-full transition-all duration-1000 shadow-lg`}
            style={{ width: `${currentStageData.progress}%` }}
          ></div>
          
          {/* Stages */}
          <div className="relative flex justify-between">
            {DELIVERY_STAGES.map((stage) => {
              const Icon = stage.icon
              const isCompleted = stage.id < currentStage
              const isCurrent = stage.id === currentStage
              const isPending = stage.id > currentStage

              return (
                <div key={stage.id} className="flex flex-col items-center relative">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl relative ${
                      isCompleted || isCurrent
                        ? `bg-gradient-to-r ${stage.color} text-white scale-110`
                        : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-purple-200 animate-pulse' : ''}`}
                  >
                    <Icon className="w-8 h-8" />
                    {isCurrent && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-75"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      </>
                    )}
                    {isCompleted && (
                      <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 bg-white text-green-500 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`mt-3 text-sm font-bold text-center max-w-[100px] ${
                      isCurrent
                        ? 'text-purple-600'
                        : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {stage.name}
                  </span>
                  {getStageTime(stage.id) && (
                    <span className="text-xs text-gray-500 mt-1">
                      {getStageTime(stage.id)}
                    </span>
                  )}
                  {isCurrent && !getStageTime(stage.id) && stage.id !== 1 && (
                    <span className="text-xs text-purple-600 mt-1 font-semibold animate-pulse">
                      In Progress...
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Status Card */}
        <div className={`mt-12 bg-gradient-to-r ${currentStageData.color} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 animate-pulse" />
                <span className="text-sm font-semibold opacity-90">Current Status</span>
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold animate-pulse">
                  LIVE
                </span>
              </div>
              <h3 className="text-3xl font-black">{currentStageData.name}</h3>
              {trackingData?.estimatedTime && (
                <p className="mt-2 opacity-90 flex items-center gap-2">
                  <span>⏱️</span>
                  <span>Estimated delivery: {trackingData.estimatedTime}</span>
                </p>
              )}
              {currentStage < 4 && (
                <p className="mt-2 text-sm opacity-80">
                  {currentStage === 1 && "✅ Your order has been confirmed and is being prepared"}
                  {currentStage === 2 && "👨‍🍳 Chef is preparing your delicious meal"}
                  {currentStage === 3 && "🚚 Your order is on the way to you"}
                </p>
              )}
              {currentStage === 4 && (
                <p className="mt-2 text-sm opacity-80">
                  🎉 Your order has been delivered! Enjoy your meal!
                </p>
              )}
            </div>
            <div className="text-6xl opacity-20 relative">
              {currentStage < 4 && (
                <div className="absolute inset-0 animate-spin-slow">
                  <currentStageData.icon className="w-24 h-24" />
                </div>
              )}
              <currentStageData.icon className="w-24 h-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            Order Details
          </h3>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex-1">
                  <span className="font-bold text-gray-900">{item.name}</span>
                  {item.toppings && item.toppings.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">+ {item.toppings.join(', ')}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                </div>
                <span className="text-lg font-black text-purple-600">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-gray-200 mt-6 pt-6 flex justify-between text-xl">
            <span className="font-bold text-gray-900">Total:</span>
            <span className="font-black gradient-text">
              ${typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-600" />
            Delivery Information
          </h3>
          <div className="space-y-4">
            {order.name && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Customer Name</div>
                  <div className="font-semibold text-gray-900">{order.name}</div>
                </div>
              </div>
            )}
            {order.address && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Delivery Address</div>
                  <div className="font-semibold text-gray-900">{order.address}</div>
                </div>
              </div>
            )}
            {order.phone && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Phone Number</div>
                  <div className="font-semibold text-gray-900">{order.phone}</div>
                </div>
              </div>
            )}
            {order.deliveryDate && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Delivery Date & Time</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(order.deliveryDate).toLocaleDateString()} at {order.deliveryTime}
                  </div>
                </div>
              </div>
            )}
            {order.specialInstructions && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-sm text-purple-600 font-semibold mb-1">Special Instructions</div>
                <div className="text-gray-700">{order.specialInstructions}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}