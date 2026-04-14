/**
 * Nobita Café — Login Page (OTP)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import OTPInput from '@/components/OTPInput'
import useAuthStore from '@/store/authStore'
import logo from '@/assets/logo/shop_logo.jpg'

export default function Login() {
  const navigate = useNavigate()
  const { sendOTP, login, isLoading } = useAuthStore()
  
  const [step, setStep] = useState('phone') // phone | otp | name
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (phone.length !== 10) {
      toast.error('Enter a valid 10-digit number')
      return
    }
    const result = await sendOTP(phone)
    if (result.success) {
      toast.success('OTP sent!')
      setStep('otp')
    } else {
      toast.error(result.error)
    }
  }

  const handleVerifyOTP = async (otpValue) => {
    setOtp(otpValue)
    const result = await login(phone, otpValue, name)
    if (result.success) {
      if (result.is_new_user) {
        setStep('name')
      } else {
        toast.success('Welcome back! ☕')
        navigate('/app')
      }
    } else {
      toast.error(result.error)
    }
  }

  const handleSetName = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    await useAuthStore.getState().updateProfile({ name })
    toast.success(`Welcome, ${name}! ☕`)
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="h-16" />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="glass-card p-8 sm:p-10 w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Nobita Café"
              className="w-28 h-28 rounded-full mx-auto mb-4 shadow-lg ring-4 ring-primary-100 object-cover"
            />
            <h1 className="font-display text-2xl sm:text-3xl text-espresso">
              {step === 'name' ? 'Welcome!' : 'Login'}
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              {step === 'phone' && 'Enter your phone number to continue'}
              {step === 'otp' && `Enter the 6-digit OTP sent to ${phone}`}
              {step === 'name' && 'Tell us your name'}
            </p>
          </div>

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <span className="input-field w-16 text-center font-semibold text-gray-500 shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="input-field flex-1 text-lg tracking-wider"
                    autoFocus
                    id="phone-input"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={phone.length !== 10 || isLoading}
                className="btn-primary w-full py-4 text-lg rounded-2xl min-h-[52px]"
                id="send-otp-btn"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Sending...
                  </span>
                ) : 'Send OTP'}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <div className="space-y-6">
              <OTPInput onComplete={handleVerifyOTP} />
              
              <button
                onClick={() => setStep('phone')}
                className="text-sm text-primary-600 hover:text-primary-700 w-full text-center 
                           py-2 min-h-[44px]"
              >
                ← Change number
              </button>

              {isLoading && (
                <div className="text-center text-sm text-gray-400">
                  Verifying...
                </div>
              )}
            </div>
          )}

          {/* Name Step (first time) */}
          {step === 'name' && (
            <form onSubmit={handleSetName} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="input-field text-lg"
                  autoFocus
                  id="name-input"
                />
              </div>
              <button
                type="submit"
                disabled={!name.trim()}
                className="btn-primary w-full py-4 text-lg rounded-2xl min-h-[52px]"
                id="save-name-btn"
              >
                Let's Go! ☕
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
