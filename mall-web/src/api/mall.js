import { http } from './http';

export const mallApi = {
  sendCode: (phone) => http.post('/auth/send-code', { phone }),
  login: (payload) => http.post('/auth/login', payload),
  profile: () => http.get('/auth/info'),
  banners: () => http.get('/home/banners'),
  recommend: (limit = 8) => http.get('/home/recommend', { params: { limit } }),
  categories: () => http.get('/categories'),
  products: (params) => http.get('/products', { params }),
  product: (id) => http.get(`/products/${id}`),
  cart: () => http.get('/cart'),
  addCart: (payload) => http.post('/cart', payload),
  updateCart: (id, payload) => http.put(`/cart/${id}`, payload),
  removeCart: (id) => http.delete(`/cart/${id}`),
  addresses: () => http.get('/addresses'),
  createOrder: (payload) => http.post('/orders', payload),
  payOrder: (id) => http.post(`/orders/${id}/pay`),
  orders: () => http.get('/orders'),
  cancelOrder: (id) => http.put(`/orders/${id}/cancel`),
  coupons: () => http.get('/coupons')
};
