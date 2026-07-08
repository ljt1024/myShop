<template>
  <div class="mall-shell">
    <header class="mall-header">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">M</span>
        <span>MyShop</span>
      </RouterLink>

      <form class="search" @submit.prevent="goSearch">
        <Search :size="18" />
        <input v-model="keyword" placeholder="搜索智能手表、咖啡、沙发" />
      </form>

      <nav class="header-actions">
        <RouterLink to="/products">全部商品</RouterLink>
        <button class="link-button" @click="quickLogin">
          <UserRound :size="18" />
          <span>{{ auth.user?.nickname || '登录' }}</span>
        </button>
        <RouterLink to="/cart" class="cart-link">
          <ShoppingCart :size="18" />
          <span>购物车</span>
          <em v-if="cart.count">{{ cart.count }}</em>
        </RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="mall-footer">
      <span>MyShop B2C MVP</span>
      <span>正品保障 · 极速发货 · 企业级运营后台</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, ShoppingCart, UserRound } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const cart = useCartStore();
const keyword = ref(route.query.keyword || '');

async function quickLogin() {
  if (!auth.isLoggedIn) {
    await auth.login('13800138000', '123456');
    await cart.fetchCart();
  }
  router.push('/user');
}

function goSearch() {
  router.push({ path: '/products', query: { keyword: keyword.value } });
}

watchEffect(() => {
  if (auth.isLoggedIn) cart.fetchCart().catch(() => {});
});
</script>
