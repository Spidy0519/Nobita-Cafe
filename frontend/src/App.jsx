/**
 * Nobita Café — Main App with Routing
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// User Pages
import Landing from '@/pages/Landing'
import Home from '@/pages/Home'
import Cart from '@/pages/Cart'

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard'

function App() {
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
        <Route path="/landing" element={<Landing />} />
        <Route path="/app" element={<Home />} />
        <Route path="/cart" element={<Cart />} />

        {/* ── Admin Dashboard ── */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
