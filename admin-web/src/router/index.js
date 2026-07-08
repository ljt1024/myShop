import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '../layouts/AdminLayout.vue';
import LoginPage from '../pages/login/LoginPage.vue';
import DashboardPage from '../pages/dashboard/DashboardPage.vue';
import ProductManagePage from '../pages/product/ProductManagePage.vue';
import OrderManagePage from '../pages/order/OrderManagePage.vue';
import UserManagePage from '../pages/user/UserManagePage.vue';
import MarketingPage from '../pages/marketing/MarketingPage.vue';

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
        { path: 'orders', name: 'orders', component: OrderManagePage },
        { path: 'users', name: 'users', component: UserManagePage },
        { path: 'marketing', name: 'marketing', component: MarketingPage }
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
