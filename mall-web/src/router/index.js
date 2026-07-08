import { createRouter, createWebHistory } from 'vue-router';
import MallLayout from '../layouts/MallLayout.vue';
import HomePage from '../pages/home/HomePage.vue';
import ProductListPage from '../pages/product/ProductListPage.vue';
import ProductDetailPage from '../pages/product/ProductDetailPage.vue';
import CartPage from '../pages/cart/CartPage.vue';
import CheckoutPage from '../pages/order/CheckoutPage.vue';
import UserCenterPage from '../pages/user/UserCenterPage.vue';
import LoginPage from '../pages/auth/LoginPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MallLayout,
      children: [
        { path: '', name: 'home', component: HomePage },
        { path: 'products', name: 'products', component: ProductListPage },
        { path: 'products/:id', name: 'product-detail', component: ProductDetailPage },
        { path: 'login', name: 'login', component: LoginPage },
        { path: 'cart', name: 'cart', component: CartPage, meta: { requiresAuth: true } },
        { path: 'checkout', name: 'checkout', component: CheckoutPage, meta: { requiresAuth: true } },
        { path: 'user', name: 'user', component: UserCenterPage, meta: { requiresAuth: true } }
      ]
    }
  ],
  scrollBehavior: () => ({ top: 0 })
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('mall_token')) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;
