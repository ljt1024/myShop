import { nanoid } from 'nanoid';
import { nextId, store } from '../models/store.js';
import { clearSelectedCart, listCart } from './cartService.js';

function serializeOrder(order) {
  return {
    ...order,
    items: order.items || [],
    address: store.addresses.find((item) => item.id === order.addressId)
  };
}

export function listAddresses(userId) {
  return store.addresses.filter((address) => address.userId === Number(userId));
}

export function listOrders(userId, query = {}) {
  const { status } = query;
  let items = store.orders.filter((order) => order.userId === Number(userId));
  if (status) {
    items = items.filter((order) => order.status === Number(status));
  }
  return items.sort((a, b) => b.id - a.id).map(serializeOrder);
}

export function getOrder(userId, id) {
  return store.orders.find((order) => order.userId === Number(userId) && order.id === Number(id));
}

export function createOrder(userId, payload = {}) {
  const cart = listCart(userId);
  const selectedItems = cart.items.filter((item) => item.selected);

  if (!selectedItems.length) {
    const err = new Error('请先选择要结算的商品');
    err.status = 400;
    throw err;
  }

  const address = payload.addressId
    ? store.addresses.find((item) => item.id === Number(payload.addressId) && item.userId === Number(userId))
    : store.addresses.find((item) => item.userId === Number(userId) && item.isDefault);

  if (!address) {
    const err = new Error('请先添加收货地址');
    err.status = 400;
    throw err;
  }

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const freightAmount = selectedItems.reduce((sum, item) => sum + Number(item.product.freight || 0), 0);
  const discountAmount = totalAmount >= 300 ? 40 : 0;
  const payAmount = Number(Math.max(0, totalAmount + freightAmount - discountAmount).toFixed(2));
  const order = {
    id: nextId(store.orders),
    orderNo: `MS${new Date().toISOString().slice(0, 10).replaceAll('-', '')}${nanoid(8).toUpperCase()}`,
    userId: Number(userId),
    addressId: address.id,
    totalAmount,
    freightAmount,
    discountAmount,
    payAmount,
    payMethod: payload.payMethod || 'mock',
    status: 10,
    remark: payload.remark || '',
    createdAt: new Date().toISOString(),
    items: selectedItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      skuId: item.skuId,
      productName: item.product.name,
      skuSpecs: item.sku?.specs || {},
      image: item.product.image,
      price: item.sku?.price || item.product.price,
      quantity: item.quantity,
      subtotal: item.subtotal
    }))
  };

  store.orders.push(order);
  clearSelectedCart(userId);
  return serializeOrder(order);
}

export function payOrder(userId, id) {
  const order = getOrder(userId, id);
  if (!order) {
    const err = new Error('订单不存在');
    err.status = 404;
    throw err;
  }
  order.status = 20;
  order.payTime = new Date().toISOString();
  return serializeOrder(order);
}

export function cancelOrder(userId, id) {
  const order = getOrder(userId, id);
  if (!order) {
    const err = new Error('订单不存在');
    err.status = 404;
    throw err;
  }
  if (order.status >= 30) {
    const err = new Error('订单已发货，无法取消');
    err.status = 400;
    throw err;
  }
  order.status = 50;
  return serializeOrder(order);
}

export function adminListOrders(query = {}) {
  const { status } = query;
  const items = status ? store.orders.filter((order) => order.status === Number(status)) : store.orders;
  return items.sort((a, b) => b.id - a.id).map(serializeOrder);
}

export function shipOrder(id, payload = {}) {
  const order = store.orders.find((item) => item.id === Number(id));
  if (!order) {
    const err = new Error('订单不存在');
    err.status = 404;
    throw err;
  }
  order.status = 30;
  order.shipment = {
    company: payload.company || '顺丰速运',
    trackingNo: payload.trackingNo || `SF${nanoid(10).toUpperCase()}`,
    shippedAt: new Date().toISOString()
  };
  return serializeOrder(order);
}
