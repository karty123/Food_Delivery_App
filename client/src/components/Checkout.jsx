import { useState, useEffect } from 'react'
import { useCart } from '../App'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'
import API_URL from '../config/api'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  Clock,
  Mail,
  FileText,
  CreditCard,
  Lock,
  CheckCircle,
  Sparkles
} from 'lucide-react'

export default function Checkout({ onBack, onOrderPlaced, restaurant }) {
  const { cart, getCartTotal } = useCart()
  const { user, getAuthHeaders, isAuthenticated } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: Delivery Info, 2: Review, 3: Payment
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi') // 'upi' or 'card'
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [cardDetailsComplete, setCardDetailsComplete] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    deliveryDate: '',
    deliveryTime: '',
    specialInstructions: ''
  })

  useEffect(() => {
    if (user && isAuthenticated) {
      loadSavedAddresses()
    }
  }, [user, isAuthenticated])

  const loadSavedAddresses = async () => {
    if (!isAuthenticated) return
    try {
      const response = await axios.get(`${API_URL}/addresses`, {
        headers: getAuthHeaders()
      })
      setSavedAddresses(response.data)
      if (response.data.length > 0) {
        const defaultAddress = response.data.find(addr => addr.isDefault) || response.data[0]
        setFormData(prev => ({ ...prev, address: defaultAddress.address }))
      }
    } catch (err) {
      // Silently fail - addresses are optional
      console.error('Error loading addresses:', err)
    }
  }

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('')
      setPromoDiscount(0)
      return
    }

    try {
      const response = await axios.post(`${API_URL}/promo/validate`, {
        code: promoCode,
        subtotal: getCartTotal()
      })
      setPromoDiscount(parseFloat(response.data.discount))
      setPromoError('')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid promo code'
      setPromoError(errorMsg)
      setPromoDiscount(0)
      error(errorMsg)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate minimum order before proceeding
    if (restaurant && getCartTotal() < restaurant.minOrder) {
      error(`Minimum order amount is $${restaurant.minOrder.toFixed(2)}. Please add more items.`)
      return
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      return
    }
    
    // Step 3: Payment - validate payment method
    if (selectedPaymentMethod === 'upi' && !paymentConfirmed) {
      error('Please confirm your UPI payment first')
      return
    }
    
    if (selectedPaymentMethod === 'card' && !cardDetailsComplete) {
      error('Please complete all card details')
      return
    }
    
    setLoading(true)
    try {
      const order = await onOrderPlaced({
        ...formData,
        promoCode: promoCode || null,
        total: grandTotal, // Pass the correct total with discount
        paymentMethod: selectedPaymentMethod
      }, user?.id || null)
      
      // Success message will be shown, and redirect happens in handlePlaceOrder
      success('Order placed successfully! Redirecting to tracking...')
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to place order. Please try again.'
      error(errorMessage)
      console.error(err)
      setLoading(false)
    }
  }

  const generateUPIPaymentString = () => {
    const upiId = 'fooddeliver@upi' // Demo UPI ID
    const amount = grandTotal.toFixed(2)
    const transactionNote = `Payment for Order`
    const merchantName = 'FoodDeliver'
    
    // UPI payment string format
    return `upi://pay?pa=${upiId}&am=${amount}&tn=${transactionNote}&pn=${merchantName}&cu=INR`
  }

  const validateCardDetails = (newDetails) => {
    const isComplete = 
      newDetails.cardNumber.replace(/\s/g, '').length >= 16 &&
      newDetails.expiryDate.length >= 5 &&
      newDetails.cvv.length >= 3 &&
      newDetails.cardholderName.length > 0
    setCardDetailsComplete(isComplete)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const getMinDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }

  const getMinTime = () => {
    if (formData.deliveryDate === new Date().toISOString().split('T')[0]) {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    }
    return '00:00'
  }

  const deliveryFee = getCartTotal() > 25 ? 0 : 4.99
  const subtotal = getCartTotal() - promoDiscount
  const tax = subtotal * 0.08
  const grandTotal = subtotal + deliveryFee + tax

  const steps = [
    { number: 1, title: 'Delivery Info', icon: MapPin },
    { number: 2, title: 'Review Order', icon: FileText },
    { number: 3, title: 'Complete', icon: CheckCircle }
  ]

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-purple-600 mb-8 transition-colors font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Menu
      </button>

      {/* Progress Steps */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep >= step.number
            const isCurrent = currentStep === step.number
            
            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-purple-200' : ''}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`mt-2 text-sm font-semibold ${
                      isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                      isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Delivery Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Delivery Information</h2>
                    <p className="text-gray-600">Tell us where to deliver your order</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                      <Phone className="w-5 h-5 text-purple-600" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                      <Mail className="w-5 h-5 text-purple-600" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      Delivery Address *
                    </label>
                    {savedAddresses.length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setFormData(prev => ({ ...prev, address: e.target.value }))
                          }
                        }}
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select saved address...</option>
                        {savedAddresses.map(addr => (
                          <option key={addr.id} value={addr.address}>
                            {addr.label}: {addr.address}
                          </option>
                        ))}
                      </select>
                    )}
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      placeholder="123 Main Street, City, State, ZIP Code"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      min={getMinDate()}
                      required
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      Delivery Time *
                    </label>
                    <input
                      type="time"
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleChange}
                      min={getMinTime()}
                      required
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Special Instructions
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleChange}
                      rows="3"
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      placeholder="Any special delivery instructions, dietary requirements, or preferences..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
                >
                  Continue to Review
                </button>
              </div>
            )}

            {/* Step 2: Review Order */}
            {currentStep === 2 && (
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Review Your Order</h2>
                    <p className="text-gray-600">Double-check everything looks good</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        {item.toppings && item.toppings.length > 0 && (
                          <p className="text-sm text-gray-600">+ {item.toppings.join(', ')}</p>
                        )}
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onBlur={validatePromoCode}
                      placeholder="Enter code (e.g., WELCOME10)"
                      className="flex-1 bg-white border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={validatePromoCode}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-red-600 text-sm mt-2">{promoError}</p>
                  )}
                  {promoDiscount > 0 && (
                    <p className="text-green-600 text-sm mt-2 font-semibold">
                      ✓ ${promoDiscount.toFixed(2)} discount applied!
                    </p>
                  )}
                </div>

                <div className="border-t-2 border-gray-200 pt-6 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount</span>
                      <span className="font-semibold">-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `$${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (8%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black pt-3 border-t-2 border-gray-200">
                    <span className="gradient-text">Total</span>
                    <span className="gradient-text">${grandTotal.toFixed(2)}</span>
                  </div>
                  {restaurant && getCartTotal() < restaurant.minOrder && (
                    <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <div className="flex items-center gap-2 text-red-600 font-semibold">
                        <span>⚠️</span>
                        <span>Minimum order: ${restaurant.minOrder.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-red-500 mt-1">
                        Add ${(restaurant.minOrder - getCartTotal()).toFixed(2)} more to your cart
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment/Complete */}
            {currentStep === 3 && (
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Payment</h2>
                    <p className="text-gray-600">Choose your payment method</p>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentMethod('upi')
                      setPaymentConfirmed(false)
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPaymentMethod === 'upi'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📱</div>
                    <div className="font-bold text-gray-900">UPI Payment</div>
                    <div className="text-sm text-gray-600">Scan QR Code</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentMethod('card')
                      setPaymentConfirmed(false)
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPaymentMethod === 'card'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">💳</div>
                    <div className="font-bold text-gray-900">Card Payment</div>
                    <div className="text-sm text-gray-600">Debit/Credit Card</div>
                  </button>
                </div>

                {/* Total Amount Display */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                    <span className="font-bold text-gray-900">Total Amount</span>
                  </div>
                  <div className="text-4xl font-black gradient-text text-center">
                    ${grandTotal.toFixed(2)}
                  </div>
                </div>

                {/* UPI Payment Section */}
                {selectedPaymentMethod === 'upi' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-black text-gray-900 mb-2">Scan QR Code to Pay</h3>
                        <p className="text-sm text-gray-600">Use any UPI app (GPay, PhonePe, Paytm)</p>
                      </div>
                      
                      {/* QR Code */}
                      <div className="flex justify-center mb-4">
                        <div className="bg-white p-4 rounded-xl shadow-lg">
                          <QRCodeSVG
                            value={generateUPIPaymentString()}
                            size={200}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                      </div>

                      <div className="text-center space-y-2">
                        <div className="text-sm text-gray-600">
                          <strong>UPI ID:</strong> fooddeliver@upi
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Amount:</strong> ${grandTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                      <p className="text-sm text-yellow-800 text-center">
                        ⚠️ Demo Mode: Click "Confirm Payment" after scanning the QR code
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaymentConfirmed(true)}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                        paymentConfirmed
                          ? 'bg-green-500 text-white'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      }`}
                    >
                      {paymentConfirmed ? '✓ Payment Confirmed' : 'Confirm Payment'}
                    </button>
                  </div>
                )}

                {/* Card Payment Section */}
                {selectedPaymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                      <h3 className="text-xl font-black text-gray-900 mb-4">Card Details</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardDetails.cardholderName}
                            onChange={(e) => {
                              const newDetails = { ...cardDetails, cardholderName: e.target.value }
                              setCardDetails(newDetails)
                              validateCardDetails(newDetails)
                            }}
                            placeholder="John Doe"
                            className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={cardDetails.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16)
                              const formatted = value.match(/.{1,4}/g)?.join(' ') || value
                              const newDetails = { ...cardDetails, cardNumber: formatted }
                              setCardDetails(newDetails)
                              validateCardDetails(newDetails)
                            }}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={cardDetails.expiryDate}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '')
                                if (value.length >= 2) {
                                  value = value.slice(0, 2) + '/' + value.slice(2, 4)
                                }
                                const newDetails = { ...cardDetails, expiryDate: value }
                                setCardDetails(newDetails)
                                validateCardDetails(newDetails)
                              }}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              value={cardDetails.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                                const newDetails = { ...cardDetails, cvv: value }
                                setCardDetails(newDetails)
                                validateCardDetails(newDetails)
                              }}
                              placeholder="123"
                              maxLength={3}
                              className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 mt-4">
                        <p className="text-xs text-yellow-800 text-center">
                          ⚠️ Demo Mode: This is a test payment. No real transaction will occur.
                        </p>
                      </div>
                    </div>

                    {cardDetailsComplete && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                        <p className="text-sm text-green-800 text-center font-semibold">
                          ✓ Card details valid. Ready to proceed.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Complete Order Button */}
                <button
                  type="submit"
                  disabled={loading || (selectedPaymentMethod === 'upi' && !paymentConfirmed) || (selectedPaymentMethod === 'card' && !cardDetailsComplete)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg flex items-center justify-center gap-2 disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Complete Order
                    </>
                  )}
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Back to Review
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 sticky top-28">
            <h3 className="text-xl font-black text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-purple-600 text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${promoDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-black pt-2 border-t-2 border-gray-200">
                <span className="gradient-text">Total</span>
                <span className="gradient-text">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {deliveryFee > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  💡 Order $25+ for <span className="font-bold">FREE delivery</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}