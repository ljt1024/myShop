import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '../layouts/AdminLayout.vue';
import LoginPage from '../pages/login/LoginPage.vue';
import DashboardPage from '../pages/dashboard/DashboardPage.vue';
import ProductManagePage from '../pages/product/ProductManagePage.vue';
import CategoryManagePage from '../pages/product/CategoryManagePage.vue';
import ReviewManagePage from '../pages/product/ReviewManagePage.vue';
import OrderManagePage from '../pages/order/OrderManagePage.vue';
import UserManagePage from '../pages/user/UserManagePage.vue';
import CouponManagePage from '../pages/marketing/CouponManagePage.vue';
import BannerManagePage from '../pages/marketing/BannerManagePage.vue';
import RoleListPage from '../pages/system/RoleListPage.vue';
import AdminListPage from '../pages/system/AdminListPage.vue';

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes: [
    { path: '/login', name: 'login', component: LoginPage },
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardPage },
        { path: 'products', name: 'products', component: ProductManagePage },
        { path: 'products/categories', name: 'categories', component: CategoryManagePage },
        { path: 'products/reviews', name: 'reviews', component: ReviewManagePage },
        { path: 'orders', name: 'orders', component: OrderManagePage },
        { path: 'users', name: 'users', component: UserManagePage },
        { path: 'marketing', redirect: '/marketing/coupons' },
        { path: 'marketing/coupons', name: 'coupons', component: CouponManagePage },
        { path: 'marketing/banners', name: 'banners', component: BannerManagePage },
        { path: 'roles', redirect: '/system/roles' },
        { path: 'system', redirect: '/system/roles' },
        { path: 'system/roles', name: 'roles', component: RoleListPage },
        { path: 'system/admins', name: 'admins', component: AdminListPage }
      ]
    }
  ]
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('admin_token')) {
    return { name: 'login' };
  }
  return true;
});

export default router;
