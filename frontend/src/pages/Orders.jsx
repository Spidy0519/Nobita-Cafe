/**
 * Nobita Café — Orders Page
 */
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import useOrderStore from '@/store/orderStore'
import useAuthStore from '@/store/authStore'

const STATUS_CONFIG = {
  PLACED: { class: 'status-placed', label: 'Placed', icon: '📋' },
  CONFIRMED: { class: 'status-confirmed', label: 'Confirmed', icon: '✅' },
  PREPARING: { class: 'status-preparing', label: 'Preparing', icon: '👨‍🍳' },
  OUT_FOR_DELIVERY: { class: 'status-out', label: 'On the Way', icon: '🛵' },
  DELIVERED: { class: 'status-delivered', label: 'Delivered', icon: '🎉' },
  CANCELLED: { class: 'status-cancelled', label: 'Cancelled', icon: '❌' },
}

export default function Orders() {
  const { isAuthenticated } = useAuthStore()
  const { orders, isLoading, fetchOrders } = useOrderStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated, fetchOrders])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="h-16" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <span className="text-7xl mb-6">🔐</span>
          <h2 className="font-display text-2xl text-espresso mb-3">Login Required</h2>
          <p className="text-gray-500 mb-6">Please login to view your orders</p>
          <Link to="/login" className="btn-primary px-8 py-3 rounded-2xl">Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="h-16" />

      <div className="container-custom py-6">
        <h1 className="font-display text-3xl text-espresso mb-6">My Orders</h1>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-4xl">☕</div>
            <p className="text-gray-400 mt-4">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-7xl mb-6 block">📋</span>
            <h2 className="font-display text-xl text-gray-500 mb-3">No orders yet</h2>
            <p className="text-gray-400 mb-6">Your order history will appear here</p>
            <Link to="/app" className="btn-primary px-8 py-3 rounded-2xl">Order Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED
              const isActive = !['DELIVERED', 'CANCELLED'].includes(order.status)

              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className={`glass-card p-5 block transition-all duration-300 hover:shadow-lg 
                             hover:-translate-y-0.5 ${isActive ? 'ring-2 ring-primary-200' : ''}`}
                  id={`order-${order.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{config.icon}</span>
                        <span className={`badge ${config.class}`}>{config.label}</span>
                        {isActive && (
                          <span className="text-xs text-primary-500 animate-pulse">● Live</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.placed_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">₹{order.grand_total}</p>
                      <p className="text-xs text-gray-400 mt-1">{order.payment_type}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
