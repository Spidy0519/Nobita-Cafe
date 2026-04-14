/**
 * Nobita Café — Admin Analytics Page
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Demo data (replace with API calls)
const DEMO_TODAY = {
  total_orders: 42,
  total_revenue: 15680,
  delivered: 35,
  cancelled: 2,
  pending: 5,
  payment_breakdown: { upi: 9200, cash: 4800, card: 1680 },
}

const DEMO_WEEKLY = [
  { date: 'Mon', revenue: 12400, orders: 38 },
  { date: 'Tue', revenue: 14200, orders: 44 },
  { date: 'Wed', revenue: 11800, orders: 36 },
  { date: 'Thu', revenue: 15680, orders: 48 },
  { date: 'Fri', revenue: 18200, orders: 56 },
  { date: 'Sat', revenue: 22400, orders: 68 },
  { date: 'Sun', revenue: 20800, orders: 62 },
]

const DEMO_TOP_ITEMS = [
  { item_name: 'Filter Kaapi', total_qty: 128 },
  { item_name: 'Cappuccino', total_qty: 96 },
  { item_name: 'Caramel Latte', total_qty: 84 },
  { item_name: 'Butter Croissant', total_qty: 72 },
  { item_name: 'Tiramisu', total_qty: 56 },
]

const PIE_COLORS = ['#d4822a', '#4ade80', '#818cf8']

export default function Analytics() {
  const today = DEMO_TODAY
  const weekly = DEMO_WEEKLY
  const topItems = DEMO_TOP_ITEMS

  const pieData = [
    { name: 'UPI', value: today.payment_breakdown.upi },
    { name: 'Cash', value: today.payment_breakdown.cash },
    { name: 'Card', value: today.payment_breakdown.card },
  ]

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Nav */}
      <nav className="bg-dark-900 border-b border-dark-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <h1 className="font-display text-xl text-primary-400">☕ Nobita Admin</h1>
          <div className="hidden sm:flex gap-1">
            <Link to="/admin" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Orders</Link>
            <Link to="/admin/menu" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Menu</Link>
            <Link to="/admin/analytics" className="px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-400 text-sm font-medium">Analytics</Link>
            <Link to="/admin/delivery" className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white text-sm">Delivery</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Today Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={today.total_orders} icon="📦" color="blue" />
          <StatCard label="Revenue" value={`₹${today.total_revenue.toLocaleString()}`} icon="💰" color="green" />
          <StatCard label="Delivered" value={today.delivered} icon="✅" color="emerald" />
          <StatCard label="Pending" value={today.pending} icon="⏳" color="amber" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weekly Revenue Chart */}
          <div className="lg:col-span-2 bg-dark-900 rounded-xl border border-dark-700 p-5">
            <h3 className="font-display text-lg text-white mb-4">Weekly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#d4822a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Pie Chart */}
          <div className="bg-dark-900 rounded-xl border border-dark-700 p-5">
            <h3 className="font-display text-lg text-white mb-4">Payment Split</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-5">
          <h3 className="font-display text-lg text-white mb-4">🏆 Top 5 Items</h3>
          <div className="space-y-3">
            {topItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-2xl w-8 text-center font-bold text-primary-400">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{item.item_name}</span>
                    <span className="text-xs text-gray-400">{item.total_qty} sold</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${(item.total_qty / topItems[0].total_qty) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 p-5 hover:border-primary-600/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  )
}
