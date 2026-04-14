/**
 * Nobita Café — Delivery Home (Assigned Orders)
 */
import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useSocket from '@/hooks/useSocket'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

const DEMO_ORDERS = [
  {
    id: 'abc-123-def',
    status: 'OUT_FOR_DELIVERY',
    total: 440,
    delivery_fee: 30,
    grand_total: 470,
    payment_type: 'UPI',
    payment_status: 'PAID',
    item_count: 3,
    placed_at: new Date().toISOString(),
    address_detail: { full_address: '123, Anna Nagar, Chennai' },
    user: { name: 'Priya K', phone: '9876543210' },
  },
  {
    id: 'ghi-456-jkl',
    status: 'PREPARING',
    total: 260,
    delivery_fee: 30,
    grand_total: 290,
    payment_type: 'CASH',
    payment_status: 'PENDING',
    item_count: 2,
    placed_at: new Date().toISOString(),
    address_detail: { full_address: '45, T Nagar, Chennai' },
    user: { name: 'Arun M', phone: '9876543211' },
  },
]

const STATUS_COLORS = {
  PREPARING: 'bg-yellow-500/20 text-yellow-400',
  OUT_FOR_DELIVERY: 'bg-orange-500/20 text-orange-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
}

export default function DeliveryHome() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState(DEMO_ORDERS)

  // WebSocket for new assignments
  useSocket(user ? `delivery_${user.id}` : 'none', useCallback((data) => {
    if (data.type === 'order.assigned') {
      setOrders((prev) => [data.order, ...prev])
      toast.success('🔔 New order assigned!')
    }
  }, []))

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="glass-dark p-8 max-w-sm w-full text-center">
          <span className="text-5xl mb-4 block">🛵</span>
          <h1 className="font-display text-2xl text-white mb-2">Delivery Portal</h1>
          <p className="text-gray-400 text-sm mb-6">Login to view your assigned orders</p>
          <Link to="/login" className="btn-primary w-full py-3 rounded-xl block">
            Login with OTP
          </Link>
        </div>
      </div>
    )
  }

  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED')
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED')

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Header */}
      <header className="bg-dark-900 border-b border-dark-700 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg text-primary-400">🛵 Delivery</h1>
            <p className="text-xs text-gray-500">Hi, {user?.name}</p>
          </div>
          <button onClick={() => { logout(); navigate('/') }} className="text-sm text-gray-400 hover:text-red-400">
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Active Orders */}
        <h2 className="text-lg font-semibold flex items-center gap-2">
          📦 Active Orders
          <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">{activeOrders.length}</span>
        </h2>

        {activeOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">☕</span>
            <p>No active orders. Relax!</p>
          </div>
        ) : (
          activeOrders.map((order) => (
            <Link
              key={order.id}
              to={`/delivery/order/${order.id}`}
              className="block bg-dark-900 rounded-xl border border-dark-700 p-4 hover:border-primary-600/50 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs text-gray-500">#{order.id.slice(0, 8)}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-primary-400 font-bold">₹{order.grand_total}</span>
              </div>
              <p className="text-sm text-gray-300 mb-1">👤 {order.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">📍 {order.address_detail?.full_address}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">{order.item_count} items</span>
                <span className="text-xs text-gray-600">•</span>
                <span className={`text-xs ${order.payment_type === 'CASH' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {order.payment_type}
                </span>
              </div>
            </Link>
          ))
        )}

        {/* Completed */}
        {completedOrders.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mt-6">✅ Completed Today</h2>
            {completedOrders.map((order) => (
              <div key={order.id} className="bg-dark-900/50 rounded-xl border border-dark-800 p-3 opacity-60">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">#{order.id.slice(0, 8)}</span>
                  <span className="text-green-400">₹{order.grand_total}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
