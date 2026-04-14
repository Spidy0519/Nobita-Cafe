/**
 * Nobita Café — Geolocation Hook
 */
import { useState, useCallback } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ latitude, longitude })

        // Reverse geocode using Nominatim (free)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'NobitaCafe/1.0' } }
          )
          const data = await res.json()
          setAddress(data.display_name || `${latitude}, ${longitude}`)
        } catch {
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        }

        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  return { location, address, loading, error, getLocation }
}

export default useGeolocation
