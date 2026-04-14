/**
 * Nobita Café — Profile Page
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import useAuthStore from '@/store/authStore'

export default function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated, updateProfile, logout } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [editing, setEditing] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="h-16" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <span className="text-7xl mb-6">👤</span>
          <h2 className="font-display text-2xl text-espresso mb-3">Login Required</h2>
          <Link to="/login" className="btn-primary px-8 py-3 rounded-2xl">Login</Link>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    const result = await updateProfile({ name })
    if (result.success) {
      toast.success('Profile updated!')
      setEditing(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="h-16" />

      <div className="container-custom py-6 max-w-lg">
        <h1 className="font-display text-3xl text-espresso mb-6">Profile</h1>

        {/* Avatar */}
        <div className="glass-card p-6 text-center mb-6 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 
                         text-white flex items-center justify-center text-4xl font-bold mx-auto mb-4 
                         shadow-lg shadow-primary-500/30">
            {user?.name?.[0] || 'U'}
          </div>
          
          {editing ? (
            <div className="space-y-3 mt-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field text-center text-lg"
              />
              <div className="flex gap-3 justify-center">
                <button onClick={handleSave} className="btn-primary px-6 py-2 text-sm rounded-xl min-h-[44px]">
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary px-6 py-2 text-sm rounded-xl min-h-[44px]">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl text-espresso">{user?.name}</h2>
              <p className="text-gray-500 text-sm mt-1">📞 +91 {user?.phone}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-primary-600 text-sm mt-3 hover:text-primary-700 min-h-[44px]"
              >
                ✏️ Edit Name
              </button>
            </>
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <Link
            to="/orders"
            className="glass-card p-4 flex items-center justify-between hover:shadow-md 
                       transition-all min-h-[56px] group"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <span className="font-medium">Order History</span>
            </span>
            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            to="/app"
            className="glass-card p-4 flex items-center justify-between hover:shadow-md 
                       transition-all min-h-[56px] group"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl">🍽️</span>
              <span className="font-medium">Browse Menu</span>
            </span>
            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <button
            onClick={handleLogout}
            className="glass-card p-4 flex items-center gap-3 w-full text-left hover:shadow-md 
                       transition-all min-h-[56px] text-red-600 hover:bg-red-50"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
