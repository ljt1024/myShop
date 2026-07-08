<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <span>M</span>
        <strong>MyShop Admin</strong>
      </div>
      <RouterLink v-for="item in nav" :key="item.to" :to="item.to">
        <component :is="item.icon" :size="18" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </aside>

    <section class="admin-main">
      <header class="admin-topbar">
        <div>
          <span class="kicker">运营后台</span>
          <h1>{{ title }}</h1>
        </div>
        <div class="admin-user">
          <span>{{ auth.admin?.nickname }}</span>
          <el-button @click="logout">退出</el-button>
        </div>
      </header>

      <RouterView />
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Boxes, ChartNoAxesColumn, Megaphone, PackageSearch, ReceiptText, UsersRound } from 'lucide-vue-next';
import { useAdminAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAdminAuthStore();
const nav = [
  { to: '/', label: '仪表盘', icon: ChartNoAxesColumn },
  { to: '/products', label: '商品管理', icon: PackageSearch },
  { to: '/orders', label: '订单管理', icon: ReceiptText },
  { to: '/users', label: '用户管理', icon: UsersRound },
  { to: '/marketing', label: '营销管理', icon: Megaphone }
];
const titleMap = {
  dashboard: '经营概览',
  products: '商品管理',
  orders: '订单管理',
  users: '用户管理',
  marketing: '营销管理'
};
const title = computed(() => titleMap[route.name] || '工作台');

function logout() {
  auth.logout();
  router.push('/login');
}
</script>
