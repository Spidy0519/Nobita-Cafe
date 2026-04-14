/**
 * Nobita Café — Floating Cart Bar Component
 */
import { Link } from 'react-router-dom'
import useCartStore from '@/store/cartStore'

export default function CartBar() {
  const items = useCartStore((s) => s.items)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">
      <Link
        to="/cart"
        className="container-custom block bg-espresso text-white rounded-2xl px-5 py-4 
                   shadow-2xl shadow-black/30 hover:bg-mocha transition-all duration-300
                   active:scale-[0.98]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center 
                          text-white font-bold animate-pulse-soft">
              {totalItems}
            </div>
            <div>
              <p className="text-sm text-white/70">Items in cart</p>
              <p className="font-semibold">View Cart</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">Total</p>
            <p className="text-xl font-bold text-primary-300">₹{subtotal}</p>
          </div>
        </div>
      </Link>
    </div>
  )
}
