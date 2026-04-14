/**
 * Nobita Café — Category Tabs Component
 */
import { useRef, useEffect } from 'react'

export default function CategoryTabs({ categories, active, onChange }) {
  const scrollRef = useRef(null)
  const activeRef = useRef(null)

  // Auto-scroll to active tab
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const activeTab = activeRef.current
      const scrollLeft = activeTab.offsetLeft - container.offsetWidth / 2 + activeTab.offsetWidth / 2
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [active])

  return (
    <div className="sticky top-16 z-40 bg-cream/95 backdrop-blur-lg border-b border-primary-100/50">
      <div
        ref={scrollRef}
        className="container-custom flex gap-2 py-3 overflow-x-auto scrollbar-hide"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            ref={cat.id === active ? activeRef : null}
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap 
                       font-medium text-sm transition-all duration-300 min-h-[44px] shrink-0
              ${
                cat.id === active
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25 scale-105'
                  : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-700 shadow-sm'
              }`}
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
