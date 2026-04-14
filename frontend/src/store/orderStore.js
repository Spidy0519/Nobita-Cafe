/**
 * Nobita Café — Order Store (Zustand)
 */
import { create } from 'zustand'
import { orderApi } from '@/api'

const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true })
    try {
      const res = await orderApi.getOrders()
      set({ orders: res.data, isLoading: false })
    } catch (err) {
      set({ error: 'Failed to load orders', isLoading: false })
    }
  },

  fetchOrder: async (id) => {
    set({ isLoading: true })
    try {
      const res = await orderApi.getOrder(id)
      set({ currentOrder: res.data, isLoading: false })
    } catch (err) {
      set({ error: 'Failed to load order', isLoading: false })
    }
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
      currentOrder:
        state.currentOrder?.id === orderId
          ? { ...state.currentOrder, status }
          : state.currentOrder,
    }))
  },
}))

export default useOrderStore
