/**
 * Nobita Café — Order Detail / Live Tracking Page
 */
import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import OrderTimeline from '@/components/OrderTimeline'
import useOrderStore from '@/store/orderStore'
import useSocket from '@/hooks/useSocket'

export default function OrderDetail() {
  const { id } = useParams()
  const { currentOrder, isLoading, fetchOrder, updateOrderStatus } = useOrderStore()

  // WebSocket for real-time updates
  useSocket(id, (data) => {
    if (data.type === 'order.status_update' || data.type === 'delivery.status_update') {
      updateOrderStatus(data.order_id, data.status)
    }
  })

  useEffect(() => {
    fetchOrder(id)
  }, [id, fetchOrder])

  if (isLoading || !currentOrder) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="h-16" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin text-5xl mb-4">☕</div>
            <p className="text-gray-400">Loading order...</p>
          </div>
        </div>
      </div>
    )
  }

  const order = currentOrder

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="h-16" />

      <div className="container-custom py-6 max-w-2xl">
        {/* Back */}
        <Link to="/orders" className="text-sm text-primary-600 hover:text-primary-700 mb-4 
                                     inline-flex items-center gap-1 min-h-[44px]">
          ← Back to Orders
        </Link>

        <div className="glass-card p-6 mb-6 animate-fade-in">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="font-display text-2xl text-espresso">Order #{order.id?.slice(0, 8)}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(order.placed_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <span className="text-2xl font-bold text-primary-600">₹{order.grand_total}</span>
          </div>

          {/* Timeline */}
          <OrderTimeline status={order.status} />
        </div>

        {/* Delivery Man Info */}
        {order.delivery_man_name && (
          <div className="glass-card p-5 mb-4 animate-fade-in">
            <h3 className="font-display text-lg text-espresso mb-3">🛵 Delivery Partner</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center 
                               justify-center text-primary-700 font-bold text-lg">
                  {order.delivery_man_name[0]}
                </div>
                <div>
                  <p className="font-semibold">{order.delivery_man_name}</p>
                  <p className="text-sm text-gray-500">{order.delivery_man_phone}</p>
                </div>
              </div>
              {order.delivery_man_phone && (
                <a
                  href={`tel:${order.delivery_man_phone}`}
                  className="btn-secondary px-4 py-2 text-sm rounded-xl min-h-[44px] 
                             flex items-center gap-1"
                >
                  📞 Call
                </a>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="glass-card p-5 mb-4 animate-fade-in">
          <h3 className="font-display text-lg text-espresso mb-3">🛒 Items</h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center 
                                  text-primary-700 text-sm font-bold">
                    {item.quantity}
                  </span>
                  <span className="text-sm">{item.item_name || item.menu_item_detail?.name}</span>
                </div>
                <span className="font-semibold text-sm">₹{item.subtotal || item.quantity * item.unit_price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="glass-card p-5 animate-fade-in">
          <h3 className="font-display text-lg text-espresso mb-3">💳 Payment</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Method</span>
              <span className="font-medium">{order.payment_type}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Status</span>
              <span className={`font-medium ${
                order.payment_status === 'PAID' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
