import axiosClient from './axiosClient'

export const authApi = {
  sendOTP: (phone) => axiosClient.post('/auth/send-otp/', { phone }),
  verifyOTP: (phone, otp, name) => axiosClient.post('/auth/verify-otp/', { phone, otp, name }),
  getProfile: () => axiosClient.get('/auth/me/'),
  updateProfile: (data) => axiosClient.patch('/auth/me/', data),
}

export const menuApi = {
  getCategories: () => axiosClient.get('/menu/categories/'),
  getItems: (params) => axiosClient.get('/menu/items/', { params }),
  getSpecials: () => axiosClient.get('/menu/items/specials/'),
  createItem: (data) => axiosClient.post('/menu/items/', data),
  updateItem: (id, data) => axiosClient.patch(`/menu/items/${id}/`, data),
  deleteItem: (id) => axiosClient.delete(`/menu/items/${id}/`),
  uploadImage: (formData) => axiosClient.post('/menu/upload-image/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

export const orderApi = {
  placeOrder: (data) => axiosClient.post('/orders/', data),
  getOrders: () => axiosClient.get('/orders/history/'),
  getOrder: (id) => axiosClient.get(`/orders/${id}/`),
  // Admin
  getAdminOrders: (params) => axiosClient.get('/admin/orders/', { params }),
  updateOrderStatus: (id, status) => axiosClient.patch(`/admin/orders/${id}/status/`, { status }),
  assignDelivery: (id, delivery_man_id) => axiosClient.post(`/admin/orders/${id}/assign/`, { delivery_man_id }),
  // Delivery
  getDeliveryOrders: (params) => axiosClient.get('/delivery/orders/', { params }),
  updateDeliveryStatus: (id, data) => axiosClient.patch(`/delivery/orders/${id}/status/`, data),
}

export const paymentApi = {
  createPayment: (order_id) => axiosClient.post('/payments/create/', { order_id }),
  verifyPayment: (data) => axiosClient.post('/payments/verify/', data),
}

export const addressApi = {
  getAddresses: () => axiosClient.get('/addresses/'),
  createAddress: (data) => axiosClient.post('/addresses/', data),
  updateAddress: (id, data) => axiosClient.patch(`/addresses/${id}/`, data),
  deleteAddress: (id) => axiosClient.delete(`/addresses/${id}/`),
}

export const adminApi = {
  getAnalyticsToday: () => axiosClient.get('/admin/analytics/today/'),
  getAnalyticsWeekly: () => axiosClient.get('/admin/analytics/weekly/'),
  getDeliveryMen: () => axiosClient.get('/admin/delivery-men/'),
  createDeliveryMan: (data) => axiosClient.post('/admin/delivery-men/', data),
  updateDeliveryMan: (id, data) => axiosClient.patch(`/admin/delivery-men/${id}/`, data),
}
