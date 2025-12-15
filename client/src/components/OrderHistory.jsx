import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import axios from 'axios'
import { Clock, Package, CheckCircle, ArrowLeft, RotateCcw, Star, X, FileText } from 'lucide-react'
import { useCart } from '../App'
import API_URL from '../config/api'

export default function OrderHistory({ onBack }) {
  const { user, getAuthHeaders } = useAuth()
  const { addToCart } = useCart()
  const { success, error } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, getAuthHeaders])

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: getAuthHeaders()
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (order) => {
    try {
      const response = await axios.post(`${API_URL}/orders/${order.id}/reorder`, {}, {
        headers: getAuthHeaders()
      })
      
      // Add items to cart
      response.data.items.forEach(item => {
        const menuItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          image: item.image
        }
        addToCart(menuItem, item.quantity, item.toppings || [])
      })
      
      success('Items added to cart!')
    } catch (err) {
      console.error('Error reordering:', err)
      error('Failed to reorder. Please try again.')
    }
  }

  const handleCancelOrder = async (order) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }
    try {
      const response = await axios.post(`${API_URL}/orders/${order.id}/cancel`, {}, {
        headers: getAuthHeaders()
      })
      setOrders(prev => prev.map(o => o.id === order.id ? response.data.order : o))
      success('Order cancelled successfully!')
    } catch (err) {
      console.error('Error cancelling order:', err)
      error(err.response?.data?.error || 'Failed to cancel order. Please try again.')
    }
  }

  const handleDownloadReceipt = (order) => {
    // Generate receipt HTML
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt - Order ${order.id.slice(0, 8).toUpperCase()}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
    .order-info { margin-bottom: 20px; }
    .items { margin: 20px 0; }
    .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .total { font-size: 20px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Food Delivery Receipt</h1>
    <p>Order #${order.id.slice(0, 8).toUpperCase()}</p>
  </div>
  <div class="order-info">
    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    ${order.name ? `<p><strong>Name:</strong> ${order.name}</p>` : ''}
    ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
    ${order.address ? `<p><strong>Address:</strong> ${order.address}</p>` : ''}
    ${order.deliveryDate ? `<p><strong>Delivery:</strong> ${new Date(order.deliveryDate).toLocaleDateString()} at ${order.deliveryTime}</p>` : ''}
  </div>
  <div class="items">
    <h2>Items:</h2>
    ${order.items.map(item => `
      <div class="item-row">
        <span>${item.name} x${item.quantity}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('')}
  </div>
  <div class="total">
    <div style="display: flex; justify-content: space-between;">
      <span>Subtotal:</span>
      <span>$${parseFloat(order.subtotal || order.total).toFixed(2)}</span>
    </div>
    ${order.discount && parseFloat(order.discount) > 0 ? `
      <div style="display: flex; justify-content: space-between; color: green;">
        <span>Discount:</span>
        <span>-$${parseFloat(order.discount).toFixed(2)}</span>
      </div>
    ` : ''}
    <div style="display: flex; justify-content: space-between; margin-top: 10px;">
      <span>Total:</span>
      <span>$${parseFloat(order.total).toFixed(2)}</span>
    </div>
  </div>
  <div class="footer">
    <p>Thank you for your order!</p>
    <p>Food Delivery System</p>
  </div>
</body>
</html>
    `
    
    // Create blob and download
    const blob = new Blob([receiptHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${order.id.slice(0, 8)}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Receipt downloaded!')
  }

  const getStatusIcon = (status, stage) => {
    if (status === 'delivered' || stage === 4) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    if (stage === 3) {
      return <Package className="w-5 h-5 text-orange-500" />
    }
    return <Clock className="w-5 h-5 text-blue-500" />
  }

  const getStatusText = (status, stage) => {
    if (status === 'delivered' || stage === 4) return 'Delivered'
    if (stage === 3) return 'Out for Delivery'
    if (stage === 2) return 'Preparing'
    return 'Confirmed'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading order history...</div>
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
        <h2 className="text-4xl font-black text-gray-900 mb-2">Order History</h2>
        <p className="text-gray-600 mb-8">View all your past orders</p>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No orders yet</p>
            <p className="text-gray-500">Start ordering to see your history here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:border-purple-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.status, order.stage)}
                      <span className="font-bold text-gray-900">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'delivered' || order.stage === 4
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {getStatusText(order.status, order.stage)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black gradient-text mb-1">
                      ${parseFloat(order.total).toFixed(2)}
                    </div>
                    {order.discount && parseFloat(order.discount) > 0 && (
                      <div className="text-sm text-green-600">
                        Saved ${parseFloat(order.discount).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Items:</div>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm text-gray-600">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleReorder(order)}
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-purple-600 font-semibold px-4 py-2 rounded-xl border-2 border-purple-200 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reorder
                  </button>
                  {order.canCancel && order.stage < 3 && order.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelOrder(order)}
                      className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 font-semibold px-4 py-2 rounded-xl border-2 border-red-200 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancel Order
                    </button>
                  )}
                  {(order.status === 'delivered' || order.status === 'confirmed' || order.status === 'cancelled') && (
                    <button
                      onClick={() => handleDownloadReceipt(order)}
                      className="flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-600 font-semibold px-4 py-2 rounded-xl border-2 border-blue-200 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      Receipt
                    </button>
                  )}
                  {order.deliveryDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {new Date(order.deliveryDate).toLocaleDateString()} at {order.deliveryTime}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
