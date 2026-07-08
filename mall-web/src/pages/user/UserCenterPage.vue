<template>
  <section class="user-hero">
    <div>
      <span class="eyebrow">Account</span>
      <h1>{{ auth.user?.nickname || '演示用户' }}</h1>
      <p>{{ auth.user?.phone }}</p>
    </div>
    <button class="ghost-btn" @click="logout">退出登录</button>
  </section>

  <section class="section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">Orders</span>
        <h2>我的订单</h2>
      </div>
    </div>

    <div v-if="orders.length" class="order-list">
      <article v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-card__head">
          <span>{{ order.orderNo }}</span>
          <strong>{{ statusMap[order.status] }}</strong>
        </div>
        <div class="mini-line" v-for="item in order.items" :key="item.id">
          <img :src="item.image" :alt="item.productName" />
          <span>{{ item.productName }} × {{ item.quantity }}</span>
          <strong>{{ money(item.subtotal) }}</strong>
        </div>
        <div class="order-card__foot">
          <span>实付 {{ money(order.payAmount) }}</span>
          <button v-if="order.status === 10" @click="pay(order.id)">去支付</button>
          <button v-if="order.status < 30" @click="cancel(order.id)">取消订单</button>
        </div>
      </article>
    </div>
    <div v-else class="empty-state">
      <PackageOpen :size="44" />
      <h2>还没有订单</h2>
      <RouterLink class="primary-btn" to="/products">去下第一单</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { PackageOpen } from 'lucide-vue-next';
import { mallApi } from '../../api/mall';
import { useAuthStore } from '../../stores/auth';
import { money } from '../../utils/money';

const router = useRouter();
const auth = useAuthStore();
const orders = ref([]);
const statusMap = { 10: '待支付', 20: '待发货', 30: '待收货', 40: '已完成', 50: '已取消' };

async function fetchOrders() {
  const res = await mallApi.orders();
  orders.value = res.data;
}

async function pay(id) {
  await mallApi.payOrder(id);
  await fetchOrders();
}

async function cancel(id) {
  await mallApi.cancelOrder(id);
  await fetchOrders();
}

function logout() {
  auth.logout();
  router.push('/');
}

onMounted(fetchOrders);
</script>
