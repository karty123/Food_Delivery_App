import { useCart } from '../App'
import { useToast } from '../contexts/ToastContext'
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react'

export default function Cart({ onCheckout }) {
  const { cart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal } = useCart()
  const { success, warning } = useToast()

  const handleRemoveFromCart = (index, itemName) => {
    removeFromCart(index)
    success(`${itemName} removed from cart`)
  }

  const handleClearCart = () => {
    if (cart.length > 0) {
      clearCart()
      success('Cart cleared')
    }
  }

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 sticky top-28">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Your Cart</h2>
            <p className="text-sm text-gray-600">Items you've selected</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-12 h-12 text-purple-400" />
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</p>
          <p className="text-sm text-gray-500">Add some delicious items to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 sticky top-28">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Your Cart</h2>
            <p className="text-xs text-gray-500">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</p>
          </div>
        </div>
        <button
          onClick={handleClearCart}
          className="text-sm text-red-500 hover:text-red-600 font-semibold transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {cart.map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 hover:border-purple-300 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                {item.toppings && item.toppings.length > 0 && (
                  <p className="text-xs text-gray-600 mb-2">
                    {item.toppings.join(', ')}
                  </p>
                )}
                <p className="text-lg font-black text-purple-600">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => handleRemoveFromCart(index, item.name)}
                className="ml-3 p-1.5 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 border border-gray-200">
                <button
                  onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                  className="w-7 h-7 rounded-md bg-gray-50 text-gray-700 font-bold hover:bg-purple-100 hover:text-purple-600 transition-colors flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-gray-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                  className="w-7 h-7 rounded-md bg-gray-50 text-gray-700 font-bold hover:bg-purple-100 hover:text-purple-600 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                ${item.price.toFixed(2)} each
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-gray-200 pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
          <span className="text-2xl font-black gradient-text">
            ${getCartTotal().toFixed(2)}
          </span>
        </div>
        <div className="text-xs text-gray-500 text-center">
          Delivery fee calculated at checkout
        </div>

        <button
          onClick={onCheckout}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
        >
          Proceed to Checkout
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}