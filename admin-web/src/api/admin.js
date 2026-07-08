import { http } from './http';

export const adminApi = {
  login: (payload) => http.post('/auth/login', payload),
  overview: () => http.get('/stats/overview'),
  products: (params) => http.get('/products', { params }),
  createProduct: (payload) => http.post('/products', payload),
  updateProduct: (id, payload) => http.put(`/products/${id}`, payload),
  deleteProduct: (id) => http.delete(`/products/${id}`),
  orders: (params) => http.get('/orders', { params }),
  shipOrder: (id, payload) => http.put(`/orders/${id}/ship`, payload),
  users: () => http.get('/users'),
  toggleUser: (id) => http.put(`/users/${id}/status`),
  coupons: () => http.get('/coupons'),
  createCoupon: (payload) => http.post('/coupons', payload)
};
