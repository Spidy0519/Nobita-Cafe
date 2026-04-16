/**
 * Nobita Café — Menu Item Card Component
 */
import { useState } from 'react'
import useCartStore from '@/store/cartStore'

const BADGE_STYLES = {
  popular: 'badge-popular',
  new: 'badge-new',
  chef: 'badge-chef',
}

const BADGE_LABELS = {
  popular: '🔥 Popular',
  new: '✨ New',
  chef: '👨‍🍳 Chef\'s Pick',
}

export default function MenuItemCard({ item }) {
  const [imgError, setImgError] = useState(false)
  const { addItem, getItemQuantity, increment, decrement } = useCartStore()
  const quantity = getItemQuantity(item.id)

  return (
    <div className="menu-card group" id={`menu-item-${item.id}`}>
      {/* Image */}
      <div className="menu-card-image">
        {!imgError ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 
                          flex items-center justify-center text-4xl">
            ☕
          </div>
        )}

        {/* Badge */}
        {item.badge && (
          <span className={`absolute top-3 left-3 ${BADGE_STYLES[item.badge] || 'badge'}`}>
            {BADGE_LABELS[item.badge] || item.badge}
          </span>
        )}

        {/* Desktop hover overlay with add to cart */}
        <div className="menu-card-overlay hidden md:flex">
          {quantity === 0 ? (
            <button
              onClick={() => addItem(item)}
              className="bg-white text-espresso px-6 py-2.5 rounded-full font-semibold
                         shadow-lg hover:bg-primary-500 hover:text-white transition-all 
                         duration-300 text-sm active:scale-95"
            >
              + Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-white rounded-full px-3 py-1.5 shadow-lg">
              <button
                onClick={() => decrement(item.id)}
                className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 
                           flex items-center justify-center font-bold hover:bg-primary-200 
                           transition-colors active:scale-90"
              >
                −
              </button>
              <span className="font-bold text-espresso w-6 text-center">{quantity}</span>
              <button
                onClick={() => increment(item.id)}
                className="w-8 h-8 rounded-full bg-primary-500 text-white 
                           flex items-center justify-center font-bold hover:bg-primary-600 
                           transition-colors active:scale-90"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-base sm:text-lg font-semibold text-espresso mb-1 leading-tight">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
          {item.desc}
        </p>

        <div className="flex flex-col gap-3 min-[440px]:flex-row min-[440px]:items-center min-[440px]:justify-between">
          <span className="text-lg sm:text-xl font-bold text-primary-600">
            ₹{item.price}
          </span>

          {/* Mobile add button */}
          <div className="md:hidden w-full min-[440px]:w-auto">
            {quantity === 0 ? (
              <button
                onClick={() => addItem(item)}
                className="w-full min-[440px]:w-auto bg-primary-500 text-white px-4 py-2 rounded-xl text-sm 
                           font-semibold hover:bg-primary-600 transition-all active:scale-95
                           min-h-[44px]"
              >
                + Add
              </button>
            ) : (
              <div className="flex items-center justify-between min-[440px]:justify-start gap-2 bg-primary-50 rounded-xl px-2 py-1">
                <button
                  onClick={() => decrement(item.id)}
                  className="w-9 h-9 rounded-lg bg-white text-primary-700 
                             flex items-center justify-center font-bold shadow-sm 
                             active:scale-90 min-h-[44px] min-w-[36px]"
                >
                  −
                </button>
                <span className="font-bold text-espresso w-6 text-center">{quantity}</span>
                <button
                  onClick={() => increment(item.id)}
                  className="w-9 h-9 rounded-lg bg-primary-500 text-white 
                             flex items-center justify-center font-bold shadow-sm 
                             active:scale-90 min-h-[44px] min-w-[36px]"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
