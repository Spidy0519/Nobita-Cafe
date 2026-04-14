/**
 * Nobita Café — Main App with Routing
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import useAuthStore from '@/store/authStore'

// User Pages
import Landing from '@/pages/Landing'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Cart from '@/pages/Cart'
import Orders from '@/pages/Orders'
import OrderDetail from '@/pages/OrderDetail'
import Profile from '@/pages/Profile'

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminMenu from '@/pages/admin/MenuManage'
import AdminAnalytics from '@/pages/admin/Analytics'
import AdminDelivery from '@/pages/admin/DeliveryStaff'

// Delivery Pages
import DeliveryHome from '@/pages/delivery/DeliveryHome'
import DeliveryOrderDetail from '@/pages/delivery/DeliveryOrderDetail'

function App() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'toast-custom',
          style: {
            background: '#2C1810',
            color: '#FFF8F0',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
          duration: 3000,
        }}
      />
      <Routes>
        {/* ── User App ── */}
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/profile" element={<Profile />} />

        {/* ── Admin Dashboard ── */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/delivery" element={<AdminDelivery />} />

        {/* ── Delivery App ── */}
        <Route path="/delivery" element={<DeliveryHome />} />
        <Route path="/delivery/order/:id" element={<DeliveryOrderDetail />} />
      </Routes>
    </Router>
  )
}

export default App
