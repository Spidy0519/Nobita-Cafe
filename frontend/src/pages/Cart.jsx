/**
 * Nobita Café — Cart & Checkout Page
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import useCartStore from '@/store/cartStore'
import useAuthStore from '@/store/authStore'
import useGeolocation from '@/hooks/useGeolocation'

export default function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { items, increment, decrement, removeItem, clearCart, getSubtotal, getGrandTotal } = useCartStore()
  const { location, address, loading: geoLoading, getLocation } = useGeolocation()
  
  const [paymentType, setPaymentType] = useState('CASH')
  const [notes, setNotes] = useState('')
  const [addressText, setAddressText] = useState('')
  const [isOrdering, setIsOrdering] = useState(false)

  const subtotal = getSubtotal()
  const deliveryFee = 30
  const grandTotal = subtotal + deliveryFee

  const handleUseGPS = () => {
    getLocation()
  }

  // Update address text when GPS resolves
  if (address && !addressText) {
    setAddressText(address)
  }

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first')
      navigate('/login')
      return
    }

    if (!addressText.trim()) {
      toast.error('Please add a delivery address')
      return
    }

    setIsOrdering(true)
    try {
      const { orderApi } = await import('@/api')
      const res = await orderApi.placeOrder({
        address_text: addressText,
        latitude: location?.latitude,
        longitude: location?.longitude,
        payment_type: paymentType,
        notes,
        items: items.map((i) => ({
          menu_item_id: i.id,
          quantity: i.quantity,
        })),
      })

      clearCart()
      toast.success('Order placed! ☕')
      navigate(`/orders/${res.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setIsOrdering(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="h-16" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <span className="text-7xl mb-6">🛒</span>
          <h2 className="font-display text-2xl text-espresso mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some delicious items from our menu!</p>
          <Link to="/app" className="btn-primary px-8 py-3 rounded-2xl">
            Browse Menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="h-16" />

      <div className="container-custom py-6">
        <h1 className="font-display text-3xl text-espresso mb-6">Your Cart</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="glass-card p-4 flex gap-4 items-center animate-fade-in">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-espresso truncate">{item.name}</h3>
                  <p className="text-primary-600 font-bold">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decrement(item.id)}
                    className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center 
                               font-bold hover:bg-gray-200 active:scale-90 min-h-[44px] min-w-[36px]"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button
                    onClick={() => increment(item.id)}
                    className="w-9 h-9 rounded-lg bg-primary-500 text-white flex items-center 
                               justify-center font-bold hover:bg-primary-600 active:scale-90 
                               min-h-[44px] min-w-[36px]"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 min-h-[44px]"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Sidebar */}
          <div className="space-y-4">
            {/* Address */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display text-lg text-espresso">📍 Delivery Address</h3>
              <textarea
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Enter your delivery address..."
                className="input-field min-h-[80px] resize-none"
                id="address-input"
              />
              <button
                onClick={handleUseGPS}
                disabled={geoLoading}
                className="btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2 min-h-[44px]"
                id="gps-btn"
              >
                {geoLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Locating...
                  </>
                ) : (
                  <>📍 Use GPS Location</>
                )}
              </button>
            </div>

            {/* Special Instructions */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display text-lg text-espresso">📝 Special Instructions</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests?"
                className="input-field min-h-[60px] resize-none"
                id="notes-input"
              />
            </div>

            {/* Payment */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display text-lg text-espresso">💳 Payment</h3>
              <div className="space-y-2">
                {[
                  { value: 'UPI', label: '📱 UPI', desc: 'Google Pay, PhonePe' },
                  { value: 'CARD', label: '💳 Card', desc: 'Credit / Debit Card' },
                  { value: 'CASH', label: '💵 Cash', desc: 'Pay on delivery' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer 
                               transition-all min-h-[52px] border-2
                      ${paymentType === opt.value 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentType === opt.value}
                      onChange={() => setPaymentType(opt.value)}
                      className="accent-primary-500"
                    />
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display text-lg text-espresso">🧾 Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold text-espresso">
                  <span>Total</span>
                  <span className="text-primary-600">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isOrdering || !addressText.trim()}
              className="btn-primary w-full py-4 text-lg rounded-2xl min-h-[56px] shadow-xl 
                         shadow-primary-600/20"
              id="place-order-btn"
            >
              {isOrdering ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Placing Order...
                </span>
              ) : (
                `Place Order — ₹${grandTotal}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
