/**
 * Nobita Café — Cart Store (Zustand)
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      deliveryFee: 30,

      // Add item to cart
      addItem: (item) => {
        const items = get().items
        const existing = items.find((i) => i.id === item.id)
        
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] })
        }
      },

      // Remove item from cart
      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.id !== itemId) })
      },

      // Update quantity
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        })
      },

      // Increment
      increment: (itemId) => {
        const item = get().items.find((i) => i.id === itemId)
        if (item) {
          get().updateQuantity(itemId, item.quantity + 1)
        }
      },

      // Decrement
      decrement: (itemId) => {
        const item = get().items.find((i) => i.id === itemId)
        if (item) {
          get().updateQuantity(itemId, item.quantity - 1)
        }
      },

      // Get item quantity
      getItemQuantity: (itemId) => {
        const item = get().items.find((i) => i.id === itemId)
        return item ? item.quantity : 0
      },

      // Totals
      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },

      get grandTotal() {
        return get().subtotal + get().deliveryFee
      },

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getGrandTotal: () => {
        const subtotal = get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
        return subtotal + get().deliveryFee
      },

      // Clear cart
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'nobita-cart',
    }
  )
)

export default useCartStore
