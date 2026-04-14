/**
 * Nobita Café — Delivery Order Detail
 */
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function DeliveryOrderDetail() {
  const { id } = useParams()
  const [cashCollected, setCashCollected] = useState(false)
  const [status, setStatus] = useState('OUT_FOR_DELIVERY')

  // Demo data
  const order = {
    id,
    status,
    total: 440,
    delivery_fee: 30,
    grand_total: 470,
    payment_type: 'CASH',
    payment_status: 'PENDING',
    notes: 'Extra sugar please',
    items: [
      { id: '1', item_name: 'Filter Kaapi', quantity: 2, unit_price: 80 },
      { id: '2', item_name: 'Cappuccino', quantity: 1, unit_price: 160 },
      { id: '3', item_name: 'Butter Croissant', quantity: 1, unit_price: 120 },
    ],
    user: { name: 'Priya K', phone: '9876543210' },
    address_detail: {
      full_address: '123, Anna Nagar Main Road, Chennai 600040',
      latitude: 13.0860,
      longitude: 80.2100,
    },
  }

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === 'DELIVERED' && order.payment_type === 'CASH' && !cashCollected) {
      toast.error('Please confirm cash collection first')
      return
    }

    try {
      // await orderApi.updateDeliveryStatus(id, { status: newStatus, cash_collected: cashCollected })
      setStatus(newStatus)
      toast.success(`Status updated: ${newStatus.replace(/_/g, ' ')}`)
    } catch {
      toast.error('Update failed')
    }
  }

  const mapsUrl = order.address_detail?.latitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${order.address_detail.latitude},${order.address_detail.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address_detail.full_address)}`

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Header */}
      <header className="bg-dark-900 border-b border-dark-700 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link to="/delivery" className="text-sm text-primary-400 flex items-center gap-1 min-h-[44px]">
            ← Back
          </Link>
          <span className="text-sm text-gray-400">#{id?.slice(0, 8)}</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Customer Info */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-5">
          <h3 className="font-semibold mb-3 text-primary-400">👤 Customer</h3>
          <p className="text-lg font-medium">{order.user.name}</p>
          <p className="text-sm text-gray-400 mb-3">{order.user.phone}</p>
          
          <a
            href={`tel:${order.user.phone}`}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 
                       rounded-xl text-sm font-medium hover:bg-green-700 transition-colors min-h-[44px]"
          >
            📞 Call Customer
          </a>
        </div>

        {/* Address */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-5">
          <h3 className="font-semibold mb-3 text-primary-400">📍 Address</h3>
          <p className="text-sm text-gray-300 mb-3">{order.address_detail.full_address}</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 
                       rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
          >
            🗺️ Open in Google Maps
          </a>
        </div>

        {/* Items */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-5">
          <h3 className="font-semibold mb-3 text-primary-400">🛒 Items</h3>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b border-dark-700 last:border-0">
                <span className="text-gray-300">
                  <span className="bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded text-xs mr-2">
                    {item.quantity}x
                  </span>
                  {item.item_name}
                </span>
                <span className="text-gray-400">₹{item.quantity * item.unit_price}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 text-primary-400">
              <span>Total</span>
              <span>₹{order.grand_total}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-dark-900 rounded-xl border border-dark-700 p-5">
            <h3 className="font-semibold mb-2 text-primary-400">📝 Notes</h3>
            <p className="text-sm text-gray-300">{order.notes}</p>
          </div>
        )}

        {/* COD Cash Collection */}
        {order.payment_type === 'CASH' && status !== 'DELIVERED' && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-5">
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={cashCollected}
                onChange={(e) => setCashCollected(e.target.checked)}
                className="w-5 h-5 rounded accent-yellow-500"
              />
              <div>
                <p className="font-medium text-yellow-400">💵 Cash Collection</p>
                <p className="text-xs text-yellow-500/70">Confirm ₹{order.grand_total} collected from customer</p>
              </div>
            </label>
          </div>
        )}

        {/* Status Buttons */}
        {status !== 'DELIVERED' && (
          <div className="space-y-3 pt-2">
            {status === 'PREPARING' && (
              <button
                onClick={() => handleStatusUpdate('OUT_FOR_DELIVERY')}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg 
                           hover:bg-orange-700 transition-colors min-h-[56px] active:scale-[0.98]"
              >
                🛵 Picked Up — On the Way
              </button>
            )}
            {status === 'OUT_FOR_DELIVERY' && (
              <button
                onClick={() => handleStatusUpdate('DELIVERED')}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg 
                           hover:bg-green-700 transition-colors min-h-[56px] active:scale-[0.98]"
              >
                🎉 Mark as Delivered
              </button>
            )}
          </div>
        )}

        {status === 'DELIVERED' && (
          <div className="text-center py-8">
            <span className="text-5xl block mb-3">🎉</span>
            <h3 className="font-display text-xl text-green-400">Delivered Successfully!</h3>
          </div>
        )}
      </div>
    </div>
  )
}
