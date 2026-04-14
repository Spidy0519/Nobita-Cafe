/**
 * Nobita Café — Admin Menu Management
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { menuApi } from '@/api'
import { MENU_ITEMS, CATEGORIES } from '@/data/menuData'

export default function MenuManage() {
  const [items, setItems] = useState(MENU_ITEMS)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [editItem, setEditItem] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCat = catFilter === 'all' || item.cat === catFilter
    return matchesSearch && matchesCat
  })

  const handleToggle = (id, field) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    )
    toast.success('Updated!')
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Nav */}
      <nav className="bg-dark-900 border-b border-dark-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-xl text-primary-400">☕ Nobita Admin</h1>
            <div className="hidden sm:flex gap-1">
              <Link to="/admin" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Orders</Link>
              <Link to="/admin/menu" className="px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-400 text-sm font-medium">Menu</Link>
              <Link to="/admin/analytics" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Analytics</Link>
              <Link to="/admin/delivery" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Delivery</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white 
                       placeholder-gray-500 focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          <button
            onClick={() => { setEditItem(null); setShowForm(true) }}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium 
                       hover:bg-primary-700 transition-colors min-h-[44px]"
          >
            + Add Item
          </button>
        </div>

        {/* Table */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-800 text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">Available</th>
                  <th className="px-4 py-3 text-center">Special</th>
                  <th className="px-4 py-3 text-center">Badge</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.desc}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{item.cat}</td>
                    <td className="px-4 py-3 text-right text-primary-400 font-bold">₹{item.price}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(item.id, 'is_available')}
                        className={`w-10 h-6 rounded-full transition-all ${
                          item.is_available !== false ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                          item.is_available !== false ? 'translate-x-4' : ''
                        }`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(item.id, 'is_special')}
                        className={`w-10 h-6 rounded-full transition-all ${
                          item.is_special ? 'bg-amber-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                          item.is_special ? 'translate-x-4' : ''
                        }`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-400">{item.badge || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setEditItem(item); setShowForm(true) }}
                        className="text-primary-400 hover:text-primary-300 text-sm min-h-[32px] px-2"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
