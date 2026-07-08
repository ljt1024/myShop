<template>
  <div class="admin-shell" :class="{ 'is-collapsed': collapsed }">
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <span>M</span>
        <strong v-if="!collapsed">MyShop Admin</strong>
        <button class="sidebar-toggle" :aria-label="collapsed ? '展开导航' : '折叠导航'" @click="collapsed = !collapsed">
          <PanelLeftClose v-if="!collapsed" :size="18" />
          <PanelLeftOpen v-else :size="18" />
        </button>
      </div>
      <template v-for="item in nav" :key="item.label">
        <RouterLink v-if="item.to" :to="item.to" :title="item.label">
          <component :is="item.icon" :size="18" />
          <span v-if="!collapsed">{{ item.label }}</span>
        </RouterLink>
        <div v-else class="nav-group">
          <button class="nav-group__title" :class="{ active: isGroupActive(item) }" :title="item.label" @click="toggleGroup(item.label)">
            <component :is="item.icon" :size="18" />
            <span v-if="!collapsed">{{ item.label }}</span>
            <ChevronDown v-if="!collapsed" class="nav-group__chevron" :class="{ open: openGroups[item.label] }" :size="16" />
          </button>
          <div v-show="openGroups[item.label]" class="nav-group__children">
            <RouterLink v-for="child in item.children" :key="child.to" :to="child.to" class="nav-child" :title="child.label">
              <span v-if="collapsed" class="nav-child__dot">{{ child.label.slice(0, 1) }}</span>
              <span>{{ child.label }}</span>
            </RouterLink>
          </div>
        </div>
      </template>
    </aside>

    <section class="admin-main">
      <header class="admin-topbar">
        <div>
          <span class="kicker">运营后台</span>
          <h1>{{ title }}</h1>
        </div>
        <div class="admin-user">
          <span class="role-chip" :class="{ readonly: !auth.canWrite }">{{ auth.admin?.roleName }}</span>
          <span>{{ auth.admin?.nickname }}</span>
          <el-button @click="logout">退出</el-button>
        </div>
      </header>
      <div v-if="!auth.canWrite" class="readonly-banner">
        当前为游客只读模式，可以查看后台数据，不能执行新增、编辑、删除、发货等修改操作。
      </div>

      <RouterView />
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ChartNoAxesColumn,
  ChevronDown,
  Megaphone,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  ShieldCheck,
  UsersRound
} from 'lucide-vue-next';
import { useAdminAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAdminAuthStore();
const collapsed = ref(localStorage.getItem('admin_sidebar_collapsed') === '1');
const nav = [
  { to: '/', label: '仪表盘', icon: ChartNoAxesColumn },
  {
    label: '商品管理',
    icon: PackageSearch,
    children: [
      { to: '/products', label: '商品列表' },
      { to: '/products/categories', label: '分类管理' },
      { to: '/products/reviews', label: '评论管理' }
    ]
  },
  { to: '/orders', label: '订单管理', icon: ReceiptText },
  { to: '/users', label: '用户管理', icon: UsersRound },
  {
    label: '营销管理',
    icon: Megaphone,
    children: [
      { to: '/marketing/coupons', label: '优惠券管理' },
      { to: '/marketing/banners', label: 'Banner 管理' }
    ]
  },
  {
    label: '权限管理',
    icon: ShieldCheck,
    children: [
      { to: '/system/roles', label: '角色管理' },
      { to: '/system/admins', label: '管理员管理' }
    ]
  }
];
const titleMap = {
  dashboard: '经营概览',
  products: '商品管理',
  categories: '分类管理',
  reviews: '评论管理',
  orders: '订单管理',
  users: '用户管理',
  coupons: '优惠券管理',
  banners: 'Banner 管理',
  roles: '角色管理',
  admins: '管理员管理'
};
const title = computed(() => titleMap[route.name] || '工作台');
const defaultOpenGroups = nav.reduce((result, item) => {
  if (item.children) result[item.label] = true;
  return result;
}, {});
const openGroups = ref({
  ...defaultOpenGroups,
  ...JSON.parse(localStorage.getItem('admin_nav_open_groups') || '{}')
});

function isGroupActive(item) {
  return item.children?.some((child) => route.path === child.to || route.path.startsWith(`${child.to}/`));
}

function toggleGroup(label) {
  openGroups.value[label] = !openGroups.value[label];
}

function logout() {
  auth.logout();
  router.push('/login');
}

watch(
  collapsed,
  (value) => {
    localStorage.setItem('admin_sidebar_collapsed', value ? '1' : '0');
  },
  { immediate: true }
);

watch(
  openGroups,
  (value) => {
    localStorage.setItem('admin_nav_open_groups', JSON.stringify(value));
  },
  { deep: true, immediate: true }
);

watch(
  () => route.path,
  () => {
    nav.forEach((item) => {
      if (item.children && isGroupActive(item)) {
        openGroups.value[item.label] = true;
      }
    });
  },
  { immediate: true }
);
</script>
