/**
 * Nobita Café — Navbar Component
 */
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useCartStore from '@/store/cartStore'
import logo from '@/assets/logo/shop_logo.jpg'

export default function Navbar({ transparent = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const items = useCartStore((s) => s.items)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isLanding = location.pathname === '/'
  const showTransparent = transparent && !scrolled && isLanding

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-lg shadow-md'
      }`}
    >
      <div className="container-custom flex items-center justify-between h-16 sm:h-18">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="Nobita Café"
            className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-400/50 
                       group-hover:ring-primary-500 transition-all duration-300"
          />
          <span
            className={`font-display text-xl sm:text-2xl font-bold transition-colors duration-300 ${
              showTransparent ? 'text-white' : 'text-espresso'
            }`}
          >
            Nobita Café
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/app" label="Menu" active={location.pathname === '/app'} light={showTransparent} />
          
          {/* Cart */}
          <Link
            to="/cart"
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300
              ${showTransparent 
                ? 'text-white hover:bg-white/20' 
                : 'text-espresso hover:bg-primary-50'
              }`}
          >
            <span className="text-xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white 
                             text-xs rounded-full flex items-center justify-center font-bold
                             animate-pulse">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <Link to="/cart" className="relative p-2">
            <span className="text-xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white 
                             text-xs rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2 rounded-lg transition-colors ${
              showTransparent ? 'text-white' : 'text-espresso'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-100 
                        animate-slide-up shadow-lg">
          <div className="container-custom py-4 space-y-2">
            <MobileLink to="/app" label="🍽️ Menu" onClick={() => setMenuOpen(false)} />
            <MobileLink to="/cart" label="🛒 Cart" onClick={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, label, active, light }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
        active
          ? light
            ? 'bg-white/20 text-white'
            : 'bg-primary-50 text-primary-700'
          : light
          ? 'text-white/80 hover:text-white hover:bg-white/10'
          : 'text-gray-600 hover:text-espresso hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  )
}

function MobileLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-3 rounded-xl text-espresso font-medium 
                 hover:bg-primary-50 transition-all duration-200 min-h-[44px] 
                 flex items-center"
    >
      {label}
    </Link>
  )
}
