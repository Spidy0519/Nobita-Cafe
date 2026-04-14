/**
 * Nobita Café — Specials Banner (Auto-scroll Carousel)
 */
import { useEffect, useRef, useState } from 'react'
import { OFFERS } from '@/data/offersData'

export default function SpecialsBanner() {
  const trackRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)

  // Duplicate items for infinite loop
  const allOffers = [...OFFERS, ...OFFERS, ...OFFERS]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let animationId
    let position = 0
    const speed = 0.5 // pixels per frame

    const animate = () => {
      if (!isPaused) {
        position -= speed
        const singleSetWidth = track.scrollWidth / 3
        if (Math.abs(position) >= singleSetWidth) {
          position = 0
        }
        track.style.transform = `translateX(${position}px)`
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [isPaused])

  return (
    <div className="py-6">
      <div className="container-custom mb-4">
        <h2 className="font-display text-2xl text-espresso flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          Today's Special
        </h2>
      </div>
      
      <div
        className="overflow-hidden cursor-grab"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div ref={trackRef} className="flex gap-4 px-4 will-change-transform">
          {allOffers.map((offer, idx) => (
            <div
              key={`${offer.id}-${idx}`}
              className="shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden shadow-lg 
                         group relative"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={offer.img}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 
                             transition-transform duration-700"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${offer.gradient} opacity-60`} />
                
                {/* Badge */}
                <span className="absolute top-3 left-3 bg-white/90 text-gray-800 
                               px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                  {offer.badge}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-display text-lg font-bold text-shadow">{offer.title}</h3>
                <p className="text-sm text-white/80 mt-0.5">{offer.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
