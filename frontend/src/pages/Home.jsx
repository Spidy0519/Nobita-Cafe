/**
 * Nobita Café — Home / Menu Page
 */
import { useState, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import CategoryTabs from '@/components/CategoryTabs'
import MenuItemCard from '@/components/MenuItemCard'
import SpecialsBanner from '@/components/SpecialsBanner'
import CartBar from '@/components/CartBar'
import { CATEGORIES, MENU_ITEMS } from '@/data/menuData'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(() => {
    let items = MENU_ITEMS

    if (activeCategory !== 'all') {
      items = items.filter((item) => item.cat === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q)
      )
    }

    return items
  }, [activeCategory, searchQuery])

  return (
    <div className="min-h-screen bg-cream pb-24">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* Search Bar */}
      <div className="container-custom pt-4 pb-2">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-12 py-3.5 rounded-2xl shadow-sm border-primary-100 
                       focus:shadow-md transition-shadow"
            id="menu-search"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 
                         hover:text-gray-600 transition-colors min-h-[44px] min-w-[44px] 
                         flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Today's Special Carousel */}
      <SpecialsBanner />

      {/* Category Tabs */}
      <CategoryTabs
        categories={CATEGORIES}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Menu Grid */}
      <div className="container-custom py-6">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            {activeCategory !== 'all' && (
              <span> in {CATEGORIES.find((c) => c.id === activeCategory)?.name}</span>
            )}
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🍃</span>
            <h3 className="font-display text-xl text-gray-500 mb-2">No items found</h3>
            <p className="text-sm text-gray-400">
              Try a different category or search term
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      <CartBar />
    </div>
  )
}
