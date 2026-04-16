import axiosClient from './axiosClient'

export const orderApi = {
  // Guest-friendly Google Sheets endpoints
  placeOrder: (data) => axiosClient.post('/place-order/', data),
  getOrders: () => axiosClient.get('/orders/'),
  // Admin
  getAdminOrders: (params) => axiosClient.get('/admin/orders/', { params }),
  updateOrderStatus: (id, status) => axiosClient.patch(`/admin/orders/${id}/status/`, { status }),
}
