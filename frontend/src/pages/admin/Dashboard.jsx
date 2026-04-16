/**
 * Nobita Cafe — Admin Dashboard (Modern Sidebar + Tabs)
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { orderApi } from '@/api'

const ADMIN_PASSCODE = 'nobita123'
const ADMIN_UNLOCK_KEY = 'nobita_admin_unlocked'

const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'orders', label: 'Orders', icon: '📦' },
  { key: 'analytics', label: 'Analytics', icon: '📈' },
  { key: 'sales', label: 'Sales', icon: '💰' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
]

const TIME_FILTERS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
]

function parseOrderDate(order) {
  const raw = order.created_at || order.Timestamp || order.timestamp || ''
  if (!raw) return null
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T')
  const dt = new Date(normalized)
  return Number.isNaN(dt.getTime()) ? null : dt
}

function getRangeStart(filterKey, now) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)

  if (filterKey === 'today') return d
  if (filterKey === 'week') {
    const day = d.getDay() || 7
    d.setDate(d.getDate() - day + 1)
    return d
  }
  d.setDate(1)
  return d
}

function isPendingStatus(status) {
  return !['DELIVERED', 'CANCELLED'].includes((status || '').toUpperCase())
}

function getOrderAmount(order) {
  const raw = Number(order.grand_total || order.total || 0)
  return Number.isFinite(raw) ? raw : 0
}

export default function Dashboard() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem(ADMIN_UNLOCK_KEY) === '1'
  })
  const [passcodeInput, setPasscodeInput] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [timeFilter, setTimeFilter] = useState('today')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderApi.getAdminOrders()
      setOrders(Array.isArray(res.data) ? res.data : [])
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const poller = setInterval(fetchOrders, 5000)
    return () => clearInterval(poller)
  }, [fetchOrders])

  const now = useMemo(() => new Date(), [])

  const rangeOrders = useMemo(() => {
    const start = getRangeStart(timeFilter, now)
    return orders.filter((o) => {
      const dt = parseOrderDate(o)
      if (!dt) return true
      return dt >= start
    })
  }, [orders, timeFilter, now])

  const orderCounts = useMemo(() => {
    const todayStart = getRangeStart('today', new Date())
    const weekStart = getRangeStart('week', new Date())
    const monthStart = getRangeStart('month', new Date())

    return {
      today: orders.filter((o) => {
        const dt = parseOrderDate(o)
        return dt ? dt >= todayStart : false
      }).length,
      week: orders.filter((o) => {
        const dt = parseOrderDate(o)
        return dt ? dt >= weekStart : false
      }).length,
      month: orders.filter((o) => {
        const dt = parseOrderDate(o)
        return dt ? dt >= monthStart : false
      }).length,
    }
  }, [orders])

  const sales = useMemo(() => {
    const todayStart = getRangeStart('today', new Date())
    const weekStart = getRangeStart('week', new Date())
    const monthStart = getRangeStart('month', new Date())

    const sumFrom = (start) =>
      orders
        .filter((o) => {
          const dt = parseOrderDate(o)
          return dt ? dt >= start : false
        })
        .reduce((acc, o) => acc + getOrderAmount(o), 0)

    const currentRevenue = rangeOrders.reduce((acc, o) => acc + getOrderAmount(o), 0)
    return {
      today: sumFrom(todayStart),
      week: sumFrom(weekStart),
      month: sumFrom(monthStart),
      average: rangeOrders.length ? Math.round(currentRevenue / rangeOrders.length) : 0,
    }
  }, [orders, rangeOrders])

  const growth = useMemo(() => {
    const nowDate = new Date()
    const last7Start = new Date(nowDate)
    last7Start.setDate(last7Start.getDate() - 7)

    const prev7Start = new Date(nowDate)
    prev7Start.setDate(prev7Start.getDate() - 14)

    const current = orders.filter((o) => {
      const dt = parseOrderDate(o)
      return dt ? dt >= last7Start : false
    }).length

    const previous = orders.filter((o) => {
      const dt = parseOrderDate(o)
      return dt ? dt >= prev7Start && dt < last7Start : false
    }).length

    if (!previous) return { pct: current > 0 ? 100 : 0, rising: current > 0 }
    const pct = Math.round(((current - previous) / previous) * 100)
    return { pct, rising: pct >= 0 }
  }, [orders])

  const analyticsSeries = useMemo(() => {
    const daily = []
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date()
      day.setHours(0, 0, 0, 0)
      day.setDate(day.getDate() - i)
      const next = new Date(day)
      next.setDate(next.getDate() + 1)
      const count = orders.filter((o) => {
        const dt = parseOrderDate(o)
        return dt ? dt >= day && dt < next : false
      }).length
      daily.push({ label: day.toLocaleDateString('en-US', { weekday: 'short' }), count })
    }

    const weekly = []
    for (let i = 3; i >= 0; i -= 1) {
      const weekStart = new Date()
      weekStart.setHours(0, 0, 0, 0)
      weekStart.setDate(weekStart.getDate() - i * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      const count = orders.filter((o) => {
        const dt = parseOrderDate(o)
        return dt ? dt >= weekStart && dt < weekEnd : false
      }).length
      weekly.push({ label: `W${4 - i}`, count })
    }

    return { daily, weekly }
  }, [orders])

  const visibleOrders = useMemo(() => {
    return rangeOrders
      .filter((o) => {
        if (statusFilter === 'pending') return isPendingStatus(o.status)
        if (statusFilter === 'completed') return !isPendingStatus(o.status)
        return true
      })
      .filter((o) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          String(o.id || '').toLowerCase().includes(q) ||
          String(o.customer_name || o.Name || '').toLowerCase().includes(q) ||
          String(o.phone || o.Phone || '').toLowerCase().includes(q)
        )
      })
  }, [rangeOrders, statusFilter, searchQuery])

  const incomingCount = visibleOrders.filter((o) => isPendingStatus(o.status)).length
  const completedCount = visibleOrders.filter((o) => !isPendingStatus(o.status)).length

  const handleStatusUpdate = async (orderId, nextStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, nextStatus)
      setOrders((prev) =>
        prev.map((o) => (String(o.id) === String(orderId) ? { ...o, status: nextStatus } : o))
      )
      toast.success('Order status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleUnlock = (e) => {
    e.preventDefault()
    if (passcodeInput.trim() === ADMIN_PASSCODE) {
      setIsUnlocked(true)
      sessionStorage.setItem(ADMIN_UNLOCK_KEY, '1')
      setPasscodeInput('')
      toast.success('Admin unlocked')
      return
    }
    toast.error('Invalid passcode')
  }

  const handleLock = () => {
    setIsUnlocked(false)
    sessionStorage.removeItem(ADMIN_UNLOCK_KEY)
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0b1020] text-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#111831] border border-white/10 p-6 sm:p-7">
          <h1 className="text-2xl font-semibold text-white">Admin Access</h1>
          <p className="text-sm text-gray-400 mt-2">Enter passcode to open dashboard.</p>

          <form onSubmit={handleUnlock} className="mt-6 space-y-3">
            <input
              type="password"
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              placeholder="Enter passcode"
              className="w-full bg-[#0f162b] border border-white/10 rounded-lg px-3 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2.5 font-medium"
            >
              Unlock Dashboard
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500">Passcode hint: set by owner</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-gray-100">
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="border-b lg:border-b-0 lg:border-r border-white/10 bg-[#111831] lg:min-h-screen">
          <div className="px-5 py-5 border-b border-white/10">
            <h1 className="text-xl font-display font-bold text-white">Nobita Admin</h1>
            <p className="text-xs text-gray-400 mt-1">Food Ordering Control Panel</p>
          </div>

          <nav className="p-3 flex lg:block gap-2 overflow-x-auto scrollbar-hide">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full lg:w-full shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeTab === item.key
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-700/25'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-5 py-4 border-t border-white/10 text-xs text-gray-400 space-y-2">
            <Link to="/" className="block hover:text-white">← Back to Website</Link>
            <button onClick={handleLock} className="block hover:text-white">🔒 Lock Admin</button>
          </div>
        </aside>

        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          <header className="flex flex-wrap gap-3 items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{SIDEBAR_ITEMS.find((s) => s.key === activeTab)?.label}</h2>
              <p className="text-sm text-gray-400">Live data updates every 5 seconds</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {TIME_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTimeFilter(f.key)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    timeFilter === f.key ? 'bg-primary-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </header>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label="Orders Today" value={orderCounts.today} icon="🗓️" />
            <StatCard label="Orders Weekly" value={orderCounts.week} icon="📅" />
            <StatCard label="Orders Monthly" value={orderCounts.month} icon="📆" />
            <StatCard label="Growth (7d)" value={`${growth.pct}%`} icon={growth.rising ? '📈' : '📉'} />
          </section>

          {activeTab === 'dashboard' && (
            <section className="grid lg:grid-cols-3 gap-4">
              <Card title="Incoming Orders" value={incomingCount} subtitle="Pending / in progress" />
              <Card title="Completed Orders" value={completedCount} subtitle="Delivered / closed" />
              <Card title="Average Order Value" value={`₹${sales.average}`} subtitle="Based on selected period" />
            </section>
          )}

          {activeTab === 'orders' && (
            <section className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Orders</h3>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by id, name, phone"
                    className="bg-[#0f162b] border border-white/10 rounded-lg px-3 py-2 text-sm min-w-[220px]"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#0f162b] border border-white/10 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <MiniStat label="Incoming" value={incomingCount} tone="amber" />
                <MiniStat label="Completed" value={completedCount} tone="emerald" />
                <MiniStat label="Visible Orders" value={visibleOrders.length} tone="blue" />
              </div>

              {loading ? (
                <p className="text-gray-400 py-10 text-center">Loading orders...</p>
              ) : visibleOrders.length === 0 ? (
                <p className="text-gray-400 py-10 text-center">No orders found for this filter.</p>
              ) : (
                <div className="space-y-3">
                  {visibleOrders.map((order) => {
                    const pending = isPendingStatus(order.status)
                    return (
                      <div key={order.id} className="rounded-xl bg-[#0f162b] border border-white/10 p-3 sm:p-4">
                        <div className="flex flex-wrap items-center gap-2 justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Order #{order.id}</p>
                            <p className="font-medium text-white">{order.customer_name || order.Name || 'Guest User'}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pending ? 'bg-yellow-500/20 text-yellow-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                            {pending ? 'Pending' : 'Completed'}
                          </span>
                        </div>

                        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-gray-300">
                          <p>📞 {order.phone || order.Phone || '-'}</p>
                          <p>🍽️ {order.item_count || 0} items</p>
                          <p className="sm:col-span-2">🧾 {order.food || order.Food || '-'}</p>
                          <p className="sm:col-span-2">📍 {order.address || order.Address || '-'}</p>
                        </div>

                        <div className="mt-3 flex gap-2 flex-wrap">
                          {pending ? (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-500"
                            >
                              Mark Completed
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'PLACED')}
                              className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-500"
                            >
                              Move to Pending
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === 'analytics' && (
            <section className="grid lg:grid-cols-2 gap-4">
              <ChartCard title="Daily Trend (7 Days)" data={analyticsSeries.daily} />
              <ChartCard title="Weekly Trend" data={analyticsSeries.weekly} />
            </section>
          )}

          {activeTab === 'sales' && (
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card title="Revenue Today" value={`₹${sales.today}`} subtitle="From today's completed and pending" />
              <Card title="Revenue Weekly" value={`₹${sales.week}`} subtitle="Current week total" />
              <Card title="Revenue Monthly" value={`₹${sales.month}`} subtitle="Current month total" />
              <Card title="Average Order Value" value={`₹${sales.average}`} subtitle="Revenue / orders" />
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-lg font-semibold">Settings</h3>
              <p className="text-sm text-gray-400">Keep this section minimal and practical for daily operations.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#0f162b] p-4 border border-white/10">
                  <p className="text-sm text-gray-400">Auto refresh</p>
                  <p className="font-medium">Enabled (5s)</p>
                </div>
                <div className="rounded-xl bg-[#0f162b] p-4 border border-white/10">
                  <p className="text-sm text-gray-400">Active order source</p>
                  <p className="font-medium">Google Sheets API</p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <p className="text-xs sm:text-sm text-gray-400">{label}</p>
      <p className="mt-2 text-xl sm:text-2xl font-semibold flex items-center gap-2">
        <span>{icon}</span>
        <span>{value}</span>
      </p>
    </div>
  )
}

function Card({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
    </div>
  )
}

function MiniStat({ label, value, tone }) {
  const tones = {
    amber: 'bg-amber-500/15 text-amber-200 border-amber-400/20',
    emerald: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20',
    blue: 'bg-sky-500/15 text-sky-200 border-sky-400/20',
  }

  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  )
}

function ChartCard({ title, data }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((point) => (
          <div key={point.label}>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{point.label}</span>
              <span>{point.count}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-caramel"
                style={{ width: `${Math.max((point.count / max) * 100, point.count > 0 ? 8 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
