import express from 'express';
import { requireAdmin } from '../middlewares/auth.js';
import { ok, page } from '../utils/response.js';
import { adminLogin } from '../services/authService.js';
import { adminListProducts, getDashboardStats } from '../services/catalogService.js';
import {
  createCoupon,
  createProduct,
  deleteProduct,
  listCoupons,
  listUsers,
  toggleUserStatus,
  updateProduct
} from '../services/adminService.js';
import { adminListOrders, shipOrder } from '../services/orderService.js';

export const adminRouter = express.Router();

adminRouter.post('/auth/login', (req, res, next) => {
  try {
    res.json(ok(adminLogin(req.body), '登录成功'));
  } catch (err) {
    next(err);
  }
});

adminRouter.use(requireAdmin);

adminRouter.get('/stats/overview', (req, res) => {
  res.json(ok(getDashboardStats()));
});

adminRouter.get('/products', (req, res) => {
  const result = adminListProducts(req.query);
  res.json(page(result.list, result.pagination));
});

adminRouter.post('/products', (req, res, next) => {
  try {
    res.json(ok(createProduct(req.body), '商品已创建'));
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/products/:id', (req, res, next) => {
  try {
    res.json(ok(updateProduct(req.params.id, req.body), '商品已更新'));
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/products/:id', (req, res, next) => {
  try {
    res.json(ok(deleteProduct(req.params.id), '商品已删除'));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/orders', (req, res) => {
  res.json(ok(adminListOrders(req.query)));
});

adminRouter.put('/orders/:id/ship', (req, res, next) => {
  try {
    res.json(ok(shipOrder(req.params.id, req.body), '订单已发货'));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/users', (req, res) => {
  res.json(ok(listUsers()));
});

adminRouter.put('/users/:id/status', (req, res, next) => {
  try {
    res.json(ok(toggleUserStatus(req.params.id), '用户状态已更新'));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/coupons', (req, res) => {
  res.json(ok(listCoupons()));
});

adminRouter.post('/coupons', (req, res, next) => {
  try {
    res.json(ok(createCoupon(req.body), '优惠券已创建'));
  } catch (err) {
    next(err);
  }
});
