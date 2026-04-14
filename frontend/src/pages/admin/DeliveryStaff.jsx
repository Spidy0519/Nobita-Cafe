/**
 * Nobita Café — Admin Delivery Staff Management
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const DEMO_STAFF = [
  { id: '1', name: 'Raj Kumar', phone: '9876543210', is_active: true, is_on_duty: true, vehicle_number: 'TN 07 AB 1234', active_orders_count: 2 },
  { id: '2', name: 'Suresh M', phone: '9876543211', is_active: true, is_on_duty: false, vehicle_number: 'TN 07 CD 5678', active_orders_count: 0 },
  { id: '3', name: 'Karthik S', phone: '9876543212', is_active: true, is_on_duty: true, vehicle_number: 'TN 07 EF 9012', active_orders_count: 1 },
]

export default function DeliveryStaff() {
  const [staff, setStaff] = useState(DEMO_STAFF)
  const [showForm, setShowForm] = useState(false)
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', vehicle_number: '' })

  const toggleDuty = (id) => {
    setStaff((prev) =>
      prev.map((s) => s.id === id ? { ...s, is_on_duty: !s.is_on_duty } : s)
    )
    toast.success('Status updated')
  }

  const handleAdd = () => {
    if (!newStaff.name || !newStaff.phone) {
      toast.error('Name and phone are required')
      return
    }
    setStaff((prev) => [...prev, { ...newStaff, id: Date.now().toString(), is_active: true, is_on_duty: false, active_orders_count: 0 }])
    setNewStaff({ name: '', phone: '', vehicle_number: '' })
    setShowForm(false)
    toast.success('Staff added!')
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Nav */}
      <nav className="bg-dark-900 border-b border-dark-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <h1 className="font-display text-xl text-primary-400">☕ Nobita Admin</h1>
          <div className="hidden sm:flex gap-1">
            <Link to="/admin" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Orders</Link>
            <Link to="/admin/menu" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Menu</Link>
            <Link to="/admin/analytics" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Analytics</Link>
            <Link to="/admin/delivery" className="px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-400 text-sm font-medium">Delivery</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">🛵 Delivery Staff</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium 
                       hover:bg-primary-700 transition-colors min-h-[44px]"
          >
            + Add Staff
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-dark-900 rounded-xl border border-dark-700 p-5 mb-6 animate-fade-in space-y-3">
            <input
              type="text" placeholder="Name" value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white outline-none"
            />
            <input
              type="tel" placeholder="Phone (10 digits)" value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white outline-none"
            />
            <input
              type="text" placeholder="Vehicle Number" value={newStaff.vehicle_number}
              onChange={(e) => setNewStaff({ ...newStaff, vehicle_number: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-dark-800 border border-dark-700 text-white outline-none"
            />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 min-h-[40px]">Save</button>
              <button onClick={() => setShowForm(false)} className="bg-dark-700 text-gray-300 px-5 py-2 rounded-lg text-sm hover:bg-dark-600 min-h-[40px]">Cancel</button>
            </div>
          </div>
        )}

        {/* Staff List */}
        <div className="space-y-3">
          {staff.map((s) => (
            <div key={s.id} className="bg-dark-900 rounded-xl border border-dark-700 p-5 flex items-center justify-between hover:border-dark-600 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${s.is_on_duty ? 'bg-green-600' : 'bg-gray-600'}`}>
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-gray-400">📞 {s.phone}</p>
                  <p className="text-xs text-gray-500">🏍️ {s.vehicle_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {s.active_orders_count > 0 && (
                  <span className="text-xs bg-primary-600/20 text-primary-400 px-2 py-1 rounded">
                    {s.active_orders_count} active
                  </span>
                )}
                <button
                  onClick={() => toggleDuty(s.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px] ${
                    s.is_on_duty
                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                  }`}
                >
                  {s.is_on_duty ? '🟢 On Duty' : '⚪ Off Duty'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
