import express from 'express';
import { requireAdmin, requirePermission } from '../middlewares/auth.js';
import { ok, page } from '../utils/response.js';
import { adminLogin } from '../services/authService.js';
import { adminListProducts, getDashboardStats } from '../services/catalogService.js';
import {
  createCoupon,
  createBanner,
  createAdmin,
  createProduct,
  createRole,
  deleteAdmin,
  deleteBanner,
  deleteProduct,
  deleteRole,
  listAdmins,
  listBanners,
  listCoupons,
  listRoles,
  listUsers,
  toggleUserStatus,
  updateAdmin,
  updateBanner,
  updateProduct,
  updateRole
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

adminRouter.post('/products', requirePermission('write'), (req, res, next) => {
  try {
    res.json(ok(createProduct(req.body), '商品已创建'));
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/products/:id', requirePermission('write'), (req, res, next) => {
  try {
    res.json(ok(updateProduct(req.params.id, req.body), '商品已更新'));
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/products/:id', requirePermission('write'), (req, res, next) => {
  try {
    res.json(ok(deleteProduct(req.params.id), '商品已删除'));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/orders', (req, res) => {
  res.json(ok(adminListOrders(req.query)));
});

adminRouter.put('/orders/:id/ship', requirePermission('write'), (req, res, next) => {
  try {
    res.json(ok(shipOrder(req.params.id, req.body), '订单已发货'));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/users', (req, res) => {
  res.json(ok(listUsers()));
});

adminRouter.put('/users/:id/status', requirePermission('write'), (req, res, next) => {
  try {
    res.json(ok(toggleUserStatus(req.params.id), '用户状态已更新'));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/coupons', (req, res) => {
  res.json(ok(listCoupons()));
});

adminRouter.post('/coupons', requirePermission('write'), (req, res, next) => {
  try {
    res.json(ok(createCoupon(req.body), '优惠券已创建'));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/banners', (req, res) => {
  res.json(ok(listBanners()));
});

adminRouter.post('/banners', requirePermission('write'), (req, res, next) => {
  try {
    res.json(ok(createBanner(req.body), 'Banner 已创建'));
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/banners/:id', requirePermission('write'), (req, res, next) => {
  try {
    res.json(ok(updateBanner(req.params.id, req.body), 'Banner 已更新'));
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/banners/:id', requirePermission('write'), (req, res, next) => {
  try {
    res.json(ok(deleteBanner(req.params.id), 'Banner 已删除'));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/roles', (req, res) => {
  res.json(ok(listRoles()));
});

adminRouter.post('/roles', requirePermission('role:manage'), (req, res, next) => {
  try {
    res.json(ok(createRole(req.body), '角色已创建'));
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/roles/:code', requirePermission('role:manage'), (req, res, next) => {
  try {
    res.json(ok(updateRole(req.params.code, req.body), '角色已更新'));
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/roles/:code', requirePermission('role:manage'), (req, res, next) => {
  try {
    res.json(ok(deleteRole(req.params.code), '角色已删除'));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/admins', (req, res) => {
  res.json(ok(listAdmins()));
});

adminRouter.post('/admins', requirePermission('role:manage'), (req, res, next) => {
  try {
    res.json(ok(createAdmin(req.body), '管理员已创建'));
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/admins/:id', requirePermission('role:manage'), (req, res, next) => {
  try {
    res.json(ok(updateAdmin(req.params.id, req.body), '管理员已更新'));
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/admins/:id', requirePermission('role:manage'), (req, res, next) => {
  try {
    res.json(ok(deleteAdmin(req.params.id), '管理员已删除'));
  } catch (err) {
    next(err);
  }
});
