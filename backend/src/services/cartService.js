import { nextId, store } from '../models/store.js';
import { getProduct } from './catalogService.js';

function serializeCartItem(item) {
  const product = getProduct(item.productId);
  const sku = product?.skus.find((entry) => entry.id === item.skuId);
  return {
    ...item,
    product,
    sku,
    subtotal: Number(((sku?.price || product?.price || 0) * item.quantity).toFixed(2))
  };
}

export function listCart(userId) {
  const items = store.carts.filter((item) => item.userId === Number(userId)).map(serializeCartItem);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { items, totalAmount };
}

export function addCartItem(userId, payload) {
  const product = getProduct(payload.productId);
  if (!product) {
    const err = new Error('商品不存在');
    err.status = 404;
    throw err;
  }

  const skuId = Number(payload.skuId || product.skus[0]?.id);
  const quantity = Math.max(1, Number(payload.quantity || 1));
  const existing = store.carts.find(
    (item) => item.userId === Number(userId) && item.productId === product.id && item.skuId === skuId
  );

  if (existing) {
    existing.quantity += quantity;
    return serializeCartItem(existing);
  }

  const item = {
    id: nextId(store.carts),
    userId: Number(userId),
    productId: product.id,
    skuId,
    quantity,
    selected: true,
    createdAt: new Date().toISOString()
  };
  store.carts.push(item);
  return serializeCartItem(item);
}

export function updateCartItem(userId, id, payload) {
  const item = store.carts.find((entry) => entry.id === Number(id) && entry.userId === Number(userId));
  if (!item) {
    const err = new Error('购物车商品不存在');
    err.status = 404;
    throw err;
  }

  if (payload.quantity !== undefined) item.quantity = Math.max(1, Number(payload.quantity));
  if (payload.selected !== undefined) item.selected = Boolean(payload.selected);
  return serializeCartItem(item);
}

export function removeCartItem(userId, id) {
  const index = store.carts.findIndex((entry) => entry.id === Number(id) && entry.userId === Number(userId));
  if (index === -1) {
    const err = new Error('购物车商品不存在');
    err.status = 404;
    throw err;
  }
  store.carts.splice(index, 1);
  return true;
}

export function clearSelectedCart(userId) {
  const selectedIds = store.carts
    .filter((item) => item.userId === Number(userId) && item.selected)
    .map((item) => item.id);
  store.carts = store.carts.filter((item) => !selectedIds.includes(item.id));
}
