import { nextId, store } from '../models/store.js';
import { getProduct } from './catalogService.js';

export function createProduct(payload) {
  const product = {
    id: nextId(store.products),
    categoryId: Number(payload.categoryId || 1),
    name: payload.name,
    subTitle: payload.subTitle || '',
    price: Number(payload.price || 0),
    originalPrice: Number(payload.originalPrice || payload.price || 0),
    stock: Number(payload.stock || 0),
    soldCount: 0,
    viewCount: 0,
    freight: Number(payload.freight || 0),
    isOnSale: payload.isOnSale === undefined ? 1 : Number(payload.isOnSale),
    isRecommend: Number(payload.isRecommend || 0),
    isNew: Number(payload.isNew || 0),
    rating: 5,
    image: payload.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    images: payload.images?.length ? payload.images : [payload.image].filter(Boolean),
    params: payload.params || {},
    description: payload.description || '',
    skus: payload.skus?.length
      ? payload.skus
      : [
          {
            id: Date.now(),
            specs: { 规格: '默认' },
            price: Number(payload.price || 0),
            stock: Number(payload.stock || 0),
            skuCode: `SKU-${Date.now()}`
          }
        ]
  };

  if (!product.name) {
    const err = new Error('商品名称不能为空');
    err.status = 400;
    throw err;
  }

  store.products.unshift(product);
  return product;
}

export function updateProduct(id, payload) {
  const product = getProduct(id);
  if (!product) {
    const err = new Error('商品不存在');
    err.status = 404;
    throw err;
  }
  Object.assign(product, {
    ...payload,
    id: product.id,
    categoryId: payload.categoryId === undefined ? product.categoryId : Number(payload.categoryId),
    price: payload.price === undefined ? product.price : Number(payload.price),
    originalPrice: payload.originalPrice === undefined ? product.originalPrice : Number(payload.originalPrice),
    stock: payload.stock === undefined ? product.stock : Number(payload.stock),
    freight: payload.freight === undefined ? product.freight : Number(payload.freight)
  });
  return product;
}

export function deleteProduct(id) {
  const index = store.products.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    const err = new Error('商品不存在');
    err.status = 404;
    throw err;
  }
  store.products.splice(index, 1);
  return true;
}

export function listUsers() {
  return store.users;
}

export function toggleUserStatus(id) {
  const user = store.users.find((item) => item.id === Number(id));
  if (!user) {
    const err = new Error('用户不存在');
    err.status = 404;
    throw err;
  }
  user.status = user.status ? 0 : 1;
  return user;
}

export function listCoupons() {
  return store.coupons;
}

export function createCoupon(payload) {
  const coupon = {
    id: nextId(store.coupons),
    name: payload.name,
    type: Number(payload.type || 1),
    value: Number(payload.value || 0),
    minAmount: Number(payload.minAmount || 0),
    remainCount: Number(payload.remainCount || payload.totalCount || 0),
    status: 1
  };

  if (!coupon.name) {
    const err = new Error('优惠券名称不能为空');
    err.status = 400;
    throw err;
  }

  store.coupons.unshift(coupon);
  return coupon;
}
