/**
 * Nobita Café — OTP Input Component
 */
import { useState, useRef, useEffect } from 'react'

export default function OTPInput({ length = 6, onComplete }) {
  const [values, setValues] = useState(new Array(length).fill(''))
  const inputRefs = useRef([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newValues = [...values]
    newValues[index] = value.slice(-1)
    setValues(newValues)

    // Auto-focus next
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if complete
    const otp = newValues.join('')
    if (otp.length === length && !newValues.includes('')) {
      onComplete?.(otp)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      const newValues = [...values]
      pasted.split('').forEach((char, i) => {
        if (i < length) newValues[i] = char
      })
      setValues(newValues)
      
      const focusIndex = Math.min(pasted.length, length - 1)
      inputRefs.current[focusIndex]?.focus()

      if (pasted.length === length) {
        onComplete?.(pasted)
      }
    }
  }

  return (
    <div className="flex gap-3 justify-center">
      {values.map((val, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold 
                     rounded-xl border-2 transition-all duration-200 outline-none
                     min-h-[44px]
            ${
              val
                ? 'border-primary-500 bg-primary-50 text-espresso'
                : 'border-gray-200 bg-white text-gray-400 focus:border-primary-400 focus:bg-primary-50/50'
            }`}
          id={`otp-input-${idx}`}
        />
      ))}
    </div>
  )
}
