import { nextId, store } from '../models/store.js';
import { getProduct } from './catalogService.js';

function serializeFavorite(favorite) {
  return {
    ...favorite,
    product: getProduct(favorite.productId)
  };
}

function serializeReview(review) {
  const user = store.users.find((item) => item.id === review.userId);
  return {
    ...review,
    user: {
      id: user?.id,
      nickname: review.isAnonymous ? '匿名用户' : user?.nickname || '商城用户',
      avatar: review.isAnonymous ? '' : user?.avatar || ''
    }
  };
}

function serializeUserCoupon(userCoupon) {
  const coupon = store.coupons.find((item) => item.id === userCoupon.couponId);
  return {
    ...userCoupon,
    coupon
  };
}

export function listFavorites(userId) {
  return store.favorites
    .filter((item) => item.userId === Number(userId))
    .map(serializeFavorite)
    .filter((item) => item.product);
}

export function favoriteStatus(userId, productId) {
  return Boolean(
    store.favorites.find((item) => item.userId === Number(userId) && item.productId === Number(productId))
  );
}

export function addFavorite(userId, productId) {
  const product = getProduct(productId);
  if (!product) {
    const err = new Error('商品不存在');
    err.status = 404;
    throw err;
  }

  const existing = store.favorites.find(
    (item) => item.userId === Number(userId) && item.productId === Number(productId)
  );
  if (existing) return serializeFavorite(existing);

  const favorite = {
    id: nextId(store.favorites),
    userId: Number(userId),
    productId: Number(productId),
    createdAt: new Date().toISOString()
  };
  store.favorites.unshift(favorite);
  return serializeFavorite(favorite);
}

export function removeFavorite(userId, id) {
  const index = store.favorites.findIndex(
    (item) => item.id === Number(id) && item.userId === Number(userId)
  );
  if (index === -1) {
    const err = new Error('收藏不存在');
    err.status = 404;
    throw err;
  }
  store.favorites.splice(index, 1);
  return true;
}

export function removeFavoriteByProduct(userId, productId) {
  const index = store.favorites.findIndex(
    (item) => item.productId === Number(productId) && item.userId === Number(userId)
  );
  if (index === -1) return false;
  store.favorites.splice(index, 1);
  return true;
}

export function listReviews(productId) {
  return store.reviews
    .filter((item) => item.productId === Number(productId))
    .sort((a, b) => b.id - a.id)
    .map(serializeReview);
}

export function createReview(userId, productId, payload = {}) {
  const product = getProduct(productId);
  if (!product) {
    const err = new Error('商品不存在');
    err.status = 404;
    throw err;
  }

  const rating = Math.max(1, Math.min(5, Number(payload.rating || 5)));
  const review = {
    id: nextId(store.reviews),
    productId: Number(productId),
    userId: Number(userId),
    orderId: Number(payload.orderId || 0),
    skuId: Number(payload.skuId || product.skus[0]?.id || 0),
    rating,
    content: payload.content || '这件商品使用体验不错。',
    images: payload.images || [],
    isAnonymous: payload.isAnonymous ? 1 : 0,
    reply: '',
    replyAt: null,
    createdAt: new Date().toISOString()
  };

  store.reviews.unshift(review);
  const productReviews = store.reviews.filter((item) => item.productId === Number(productId));
  product.rating = Number(
    (productReviews.reduce((sum, item) => sum + item.rating, 0) / productReviews.length).toFixed(1)
  );
  return serializeReview(review);
}

export function listAvailableCoupons(userId) {
  const ownedCouponIds = store.userCoupons
    .filter((item) => item.userId === Number(userId))
    .map((item) => item.couponId);

  return store.coupons
    .filter((coupon) => coupon.status)
    .map((coupon) => ({
      ...coupon,
      received: ownedCouponIds.includes(coupon.id)
    }));
}

export function listUserCoupons(userId, status) {
  let items = store.userCoupons.filter((item) => item.userId === Number(userId));
  if (status !== undefined && status !== '') {
    items = items.filter((item) => item.status === Number(status));
  }
  return items.map(serializeUserCoupon).filter((item) => item.coupon);
}

export function receiveCoupon(userId, couponId) {
  const coupon = store.coupons.find((item) => item.id === Number(couponId) && item.status);
  if (!coupon) {
    const err = new Error('优惠券不存在或已停用');
    err.status = 404;
    throw err;
  }

  const existing = store.userCoupons.find(
    (item) => item.userId === Number(userId) && item.couponId === Number(couponId)
  );
  if (existing) return serializeUserCoupon(existing);

  if (coupon.remainCount <= 0) {
    const err = new Error('优惠券已领完');
    err.status = 400;
    throw err;
  }

  coupon.remainCount -= 1;
  const userCoupon = {
    id: nextId(store.userCoupons),
    userId: Number(userId),
    couponId: coupon.id,
    orderId: null,
    status: 0,
    receivedAt: new Date().toISOString(),
    usedAt: null
  };
  store.userCoupons.unshift(userCoupon);
  return serializeUserCoupon(userCoupon);
}

export function pickUsableCoupon(userId, userCouponId, amount) {
  if (!userCouponId) return null;
  const userCoupon = store.userCoupons.find(
    (item) => item.id === Number(userCouponId) && item.userId === Number(userId) && item.status === 0
  );
  if (!userCoupon) {
    const err = new Error('优惠券不可用');
    err.status = 400;
    throw err;
  }

  const coupon = store.coupons.find((item) => item.id === userCoupon.couponId && item.status);
  if (!coupon || amount < Number(coupon.minAmount || 0)) {
    const err = new Error('订单金额未达到优惠券使用门槛');
    err.status = 400;
    throw err;
  }

  return { userCoupon, coupon };
}

export function calculateCouponDiscount(coupon, amount) {
  if (!coupon) return 0;
  if (coupon.type === 2) {
    return Number((amount * (1 - Number(coupon.value))).toFixed(2));
  }
  return Math.min(Number(coupon.value || 0), amount);
}

export function markCouponUsed(userCoupon, orderId) {
  if (!userCoupon) return;
  userCoupon.status = 1;
  userCoupon.orderId = Number(orderId);
  userCoupon.usedAt = new Date().toISOString();
}
