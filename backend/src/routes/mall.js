import express from 'express';
import { ok, page } from '../utils/response.js';
import { requireAuth } from '../middlewares/auth.js';
import { mallLogin, sendCode, getUserInfo } from '../services/authService.js';
import {
  getBanners,
  getCategories,
  getProduct,
  getRecommendProducts,
  listProducts
} from '../services/catalogService.js';
import { addCartItem, listCart, removeCartItem, updateCartItem } from '../services/cartService.js';
import {
  cancelOrder,
  createAddress,
  createOrder,
  deleteAddress,
  listAddresses,
  listOrders,
  payOrder,
  updateAddress
} from '../services/orderService.js';
import {
  addFavorite,
  createReview,
  favoriteStatus,
  listAvailableCoupons,
  listFavorites,
  listReviews,
  listUserCoupons,
  receiveCoupon,
  removeFavorite,
  removeFavoriteByProduct
} from '../services/engagementService.js';

export const mallRouter = express.Router();

mallRouter.post('/auth/send-code', (req, res, next) => {
  try {
    res.json(ok(sendCode(req.body.phone), '验证码已发送'));
  } catch (err) {
    next(err);
  }
});

mallRouter.post('/auth/login', (req, res, next) => {
  try {
    res.json(ok(mallLogin(req.body), '登录成功'));
  } catch (err) {
    next(err);
  }
});

mallRouter.post('/auth/register', (req, res, next) => {
  try {
    res.json(ok(mallLogin(req.body), '注册成功'));
  } catch (err) {
    next(err);
  }
});

mallRouter.get('/auth/info', requireAuth, (req, res) => {
  res.json(ok(getUserInfo(req.user.id)));
});

mallRouter.post('/auth/logout', (req, res) => {
  res.json(ok(true, '退出成功'));
});

mallRouter.get('/home/banners', (req, res) => {
  res.json(ok(getBanners()));
});

mallRouter.get('/home/recommend', (req, res) => {
  res.json(ok(getRecommendProducts(req.query.limit)));
});

mallRouter.get('/categories', (req, res) => {
  res.json(ok(getCategories()));
});

mallRouter.get('/products/search', (req, res) => {
  const result = listProducts(req.query);
  res.json(page(result.list, result.pagination));
});

mallRouter.get('/products', (req, res) => {
  const result = listProducts(req.query);
  res.json(page(result.list, result.pagination));
});

mallRouter.get('/products/:id', (req, res, next) => {
  const product = getProduct(req.params.id);
  if (!product) {
    const err = new Error('商品不存在');
    err.status = 404;
    next(err);
    return;
  }
  product.viewCount += 1;
  res.json(ok(product));
});

mallRouter.get('/products/:id/reviews', (req, res) => {
  res.json(ok(listReviews(req.params.id)));
});

mallRouter.post('/products/:id/reviews', requireAuth, (req, res, next) => {
  try {
    res.json(ok(createReview(req.user.id, req.params.id, req.body), '评价已发布'));
  } catch (err) {
    next(err);
  }
});

mallRouter.get('/cart', requireAuth, (req, res) => {
  res.json(ok(listCart(req.user.id)));
});

mallRouter.post('/cart', requireAuth, (req, res, next) => {
  try {
    res.json(ok(addCartItem(req.user.id, req.body), '已加入购物车'));
  } catch (err) {
    next(err);
  }
});

mallRouter.put('/cart/:id', requireAuth, (req, res, next) => {
  try {
    res.json(ok(updateCartItem(req.user.id, req.params.id, req.body)));
  } catch (err) {
    next(err);
  }
});

mallRouter.delete('/cart/:id', requireAuth, (req, res, next) => {
  try {
    res.json(ok(removeCartItem(req.user.id, req.params.id), '已删除'));
  } catch (err) {
    next(err);
  }
});

mallRouter.get('/addresses', requireAuth, (req, res) => {
  res.json(ok(listAddresses(req.user.id)));
});

mallRouter.post('/addresses', requireAuth, (req, res, next) => {
  try {
    res.json(ok(createAddress(req.user.id, req.body), '地址已新增'));
  } catch (err) {
    next(err);
  }
});

mallRouter.put('/addresses/:id', requireAuth, (req, res, next) => {
  try {
    res.json(ok(updateAddress(req.user.id, req.params.id, req.body), '地址已更新'));
  } catch (err) {
    next(err);
  }
});

mallRouter.delete('/addresses/:id', requireAuth, (req, res, next) => {
  try {
    res.json(ok(deleteAddress(req.user.id, req.params.id), '地址已删除'));
  } catch (err) {
    next(err);
  }
});

mallRouter.post('/orders', requireAuth, (req, res, next) => {
  try {
    res.json(ok(createOrder(req.user.id, req.body), '订单已创建'));
  } catch (err) {
    next(err);
  }
});

mallRouter.get('/orders', requireAuth, (req, res) => {
  res.json(ok(listOrders(req.user.id, req.query)));
});

mallRouter.put('/orders/:id/cancel', requireAuth, (req, res, next) => {
  try {
    res.json(ok(cancelOrder(req.user.id, req.params.id), '订单已取消'));
  } catch (err) {
    next(err);
  }
});

mallRouter.post('/orders/:id/pay', requireAuth, (req, res, next) => {
  try {
    res.json(ok(payOrder(req.user.id, req.params.id), '支付成功'));
  } catch (err) {
    next(err);
  }
});

mallRouter.get('/favorites', requireAuth, (req, res) => {
  res.json(ok(listFavorites(req.user.id)));
});

mallRouter.get('/favorites/status/:productId', requireAuth, (req, res) => {
  res.json(ok({ favorited: favoriteStatus(req.user.id, req.params.productId) }));
});

mallRouter.post('/favorites', requireAuth, (req, res, next) => {
  try {
    res.json(ok(addFavorite(req.user.id, req.body.productId), '已收藏'));
  } catch (err) {
    next(err);
  }
});

mallRouter.delete('/favorites/:id', requireAuth, (req, res, next) => {
  try {
    res.json(ok(removeFavorite(req.user.id, req.params.id), '已取消收藏'));
  } catch (err) {
    next(err);
  }
});

mallRouter.delete('/favorites/product/:productId', requireAuth, (req, res) => {
  res.json(ok(removeFavoriteByProduct(req.user.id, req.params.productId), '已取消收藏'));
});

mallRouter.get('/coupons', requireAuth, (req, res) => {
  res.json(ok(listAvailableCoupons(req.user.id)));
});

mallRouter.get('/user-coupons', requireAuth, (req, res) => {
  res.json(ok(listUserCoupons(req.user.id, req.query.status)));
});

mallRouter.post('/coupons/receive', requireAuth, (req, res, next) => {
  try {
    res.json(ok(receiveCoupon(req.user.id, req.body.couponId), '领取成功'));
  } catch (err) {
    next(err);
  }
});
