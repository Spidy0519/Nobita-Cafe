/**
 * Nobita Cafe — Specials Banner (Manual Slider)
 */
import { useState } from 'react'
import { OFFERS } from '@/data/offersData'

export default function SpecialsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const totalSlides = OFFERS.length

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  return (
    <div className="py-6">
      <div className="container-custom mb-4">
        <h2 className="font-display text-2xl text-espresso flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          Today's Special
        </h2>
      </div>

      <div className="container-custom">
        <div className="relative overflow-hidden rounded-2xl">
          <div
            className="flex"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: 'transform 2000ms ease-in-out',
            }}
          >
            {OFFERS.map((offer) => (
              <div key={offer.id} className="w-full shrink-0 px-1">
                <div className="rounded-2xl overflow-hidden shadow-lg group relative">
                  <div className="relative h-52 sm:h-64 overflow-hidden">
                    <img
                      src={offer.img}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${offer.gradient} opacity-60`} />

                    <span className="absolute top-3 left-3 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                      {offer.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-shadow">{offer.title}</h3>
                    <p className="text-sm text-white/80 mt-0.5">{offer.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
            aria-label="Previous special"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
            aria-label="Next special"
          >
            ›
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          {OFFERS.map((offer, index) => (
            <button
              key={offer.id}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                currentIndex === index ? 'w-8 bg-primary-600' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to special ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
