/**
 * Nobita Café — Admin Dashboard (Live Orders Kanban)
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSocket from '@/hooks/useSocket'
import { orderApi, adminApi } from '@/api'

const KANBAN_COLS = [
  { key: 'PLACED', label: 'New', icon: '📋', color: 'blue' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: '✅', color: 'indigo' },
  { key: 'PREPARING', label: 'Preparing', icon: '👨‍🍳', color: 'yellow' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out', icon: '🛵', color: 'orange' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉', color: 'green' },
]

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [deliveryMen, setDeliveryMen] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAdminOrders()
      setOrders(res.data)
    } catch (err) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliveryMen = async () => {
    try {
      const res = await adminApi.getDeliveryMen()
      setDeliveryMen(res.data)
    } catch {}
  }

  useEffect(() => {
    fetchOrders()
    fetchDeliveryMen()
  }, [])

  // WebSocket: new orders
  useSocket('admin', useCallback((data) => {
    if (data.type === 'order.new') {
      setOrders((prev) => [data.order, ...prev])
      toast.success('🔔 New order received!', { duration: 5000 })
      // Play notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
        audio.play().catch(() => {})
      } catch {}
    }
    if (data.type === 'delivery.status_update' || data.type === 'order.status_update') {
      setOrders((prev) =>
        prev.map((o) => o.id === data.order_id ? { ...o, status: data.status } : o)
      )
    }
  }, []))

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
      )
      toast.success(`Order updated to ${newStatus}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleAssign = async (orderId, dmId) => {
    try {
      await orderApi.assignDelivery(orderId, dmId)
      toast.success('Delivery assigned!')
      fetchOrders()
    } catch {
      toast.error('Failed to assign')
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true
    if (filter === 'COD') return o.payment_type === 'CASH'
    if (filter === 'UPI') return o.payment_type === 'UPI'
    if (filter === 'PENDING') return o.payment_status === 'PENDING'
    return true
  })

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Admin Nav */}
      <nav className="bg-dark-900 border-b border-dark-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-xl text-primary-400">☕ Nobita Admin</h1>
            <div className="hidden sm:flex gap-1">
              <Link to="/admin" className="px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-400 text-sm font-medium">Orders</Link>
              <Link to="/admin/menu" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Menu</Link>
              <Link to="/admin/analytics" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Analytics</Link>
              <Link to="/admin/delivery" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Delivery</Link>
            </div>
          </div>
          <Link to="/" className="text-sm text-gray-400 hover:text-white">← Back to Site</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['ALL', 'COD', 'UPI', 'PENDING'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px]
                ${filter === f ? 'bg-primary-600 text-white' : 'bg-dark-800 text-gray-400 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
          <span className="text-sm text-gray-500 flex items-center ml-auto">
            {filteredOrders.length} orders
          </span>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading orders...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {KANBAN_COLS.map((col) => {
              const colOrders = filteredOrders.filter((o) => o.status === col.key)
              return (
                <div key={col.key} className="bg-dark-900 rounded-xl border border-dark-700 p-3 min-h-[300px]">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-semibold text-sm flex items-center gap-1.5">
                      {col.icon} {col.label}
                    </h3>
                    <span className="bg-dark-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                      {colOrders.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {colOrders.map((order) => (
                      <div key={order.id} className="bg-dark-800 rounded-lg p-3 border border-dark-700 hover:border-primary-600/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-500">#{order.id?.slice(0, 8)}</span>
                          <span className="text-xs text-primary-400 font-bold">₹{order.grand_total || order.total}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-1">{order.item_count || '—'} items</p>
                        <p className="text-xs text-gray-500 mb-2">{order.payment_type} • {order.payment_status}</p>
                        
                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {col.key === 'PLACED' && (
                            <button onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                              className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded hover:bg-indigo-600/40 transition-colors">
                              Confirm
                            </button>
                          )}
                          {col.key === 'CONFIRMED' && (
                            <button onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                              className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded hover:bg-yellow-600/40 transition-colors">
                              Start Prep
                            </button>
                          )}
                          {col.key === 'PREPARING' && (
                            <>
                              <button onClick={() => handleStatusUpdate(order.id, 'OUT_FOR_DELIVERY')}
                                className="text-xs bg-orange-600/20 text-orange-400 px-2 py-1 rounded hover:bg-orange-600/40 transition-colors">
                                Send Out
                              </button>
                              {!order.delivery_man && deliveryMen.length > 0 && (
                                <select
                                  onChange={(e) => e.target.value && handleAssign(order.id, e.target.value)}
                                  className="text-xs bg-dark-700 text-gray-300 rounded px-1 py-1 border-0"
                                  defaultValue=""
                                >
                                  <option value="">Assign</option>
                                  {deliveryMen.filter((d) => d.is_on_duty).map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                  ))}
                                </select>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
