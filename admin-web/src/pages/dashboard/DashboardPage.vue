<template>
  <section class="metric-grid">
    <article v-for="card in cards" :key="card.label" class="metric-card">
      <component :is="card.icon" :size="22" />
      <span>{{ card.label }}</span>
      <strong>{{ card.value }}</strong>
    </article>
  </section>

  <section class="admin-card">
    <div class="card-head">
      <div>
        <span class="kicker">近 7 天</span>
        <h2>销售趋势</h2>
      </div>
    </div>
    <div class="trend-chart">
      <div v-for="item in trend" :key="item.day" class="trend-bar">
        <span :style="{ height: `${Math.max(18, item.sales / maxSales * 180)}px` }"></span>
        <small>{{ item.day }}</small>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { AlertTriangle, Banknote, PackageCheck, ReceiptText, UsersRound } from 'lucide-vue-next';
import { adminApi } from '../../api/admin';

const stats = ref({ trend: [] });
const trend = computed(() => stats.value.trend || []);
const maxSales = computed(() => Math.max(1, ...trend.value.map((item) => item.sales)));
const cards = computed(() => [
  { label: '订单数', value: stats.value.orderCount || 0, icon: ReceiptText },
  { label: '销售额', value: `￥${Number(stats.value.totalSales || 0).toLocaleString()}`, icon: Banknote },
  { label: '用户数', value: stats.value.userCount || 0, icon: UsersRound },
  { label: '待发货', value: stats.value.pendingShipment || 0, icon: PackageCheck },
  { label: '库存预警', value: stats.value.stockWarnings || 0, icon: AlertTriangle }
]);

onMounted(async () => {
  const res = await adminApi.overview();
  stats.value = res.data;
});
</script>
