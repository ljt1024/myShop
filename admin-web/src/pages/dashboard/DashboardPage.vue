<template>
  <section class="metric-grid">
    <article v-for="card in cards" :key="card.label" class="metric-card">
      <component :is="card.icon" :size="22" />
      <span>{{ card.label }}</span>
      <strong>{{ card.value }}</strong>
      <small>{{ card.hint }}</small>
    </article>
  </section>

  <section class="dashboard-grid">
    <article class="admin-card dashboard-card dashboard-card--wide">
      <div class="card-head">
        <div>
          <span class="kicker">近 7 天</span>
          <h2>销售趋势</h2>
        </div>
        <strong class="dashboard-total">￥{{ Number(stats.totalSales || 0).toLocaleString() }}</strong>
      </div>
      <div class="trend-chart trend-chart--rich">
        <div v-for="item in trend" :key="item.day" class="trend-bar">
          <span :style="{ height: `${Math.max(18, item.sales / maxSales * 190)}px` }"></span>
          <b>{{ item.orders }}</b>
          <small>{{ item.day }}</small>
        </div>
      </div>
    </article>

    <article class="admin-card dashboard-card">
      <div class="card-head">
        <div>
          <span class="kicker">Conversion</span>
          <h2>订单漏斗</h2>
        </div>
      </div>
      <div class="funnel-list">
        <div v-for="item in funnel" :key="item.label" class="funnel-row">
          <span>{{ item.label }}</span>
          <strong>{{ item.value.toLocaleString() }}</strong>
          <i :style="{ width: `${Math.max(8, item.value / maxFunnel * 100)}%` }"></i>
        </div>
      </div>
    </article>
  </section>

  <section class="dashboard-grid dashboard-grid--three">
    <article class="admin-card dashboard-card">
      <div class="card-head">
        <div>
          <span class="kicker">Todo</span>
          <h2>待处理事项</h2>
        </div>
      </div>
      <div class="todo-list">
        <div v-for="item in stats.todoItems || []" :key="item.label" class="todo-item" :class="`todo-item--${item.level}`">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </article>

    <article class="admin-card dashboard-card">
      <div class="card-head">
        <div>
          <span class="kicker">Ranking</span>
          <h2>商品销量排行</h2>
        </div>
      </div>
      <div class="ranking-list">
        <div v-for="(product, index) in stats.productRanking || []" :key="product.id" class="ranking-row">
          <em>{{ index + 1 }}</em>
          <span>{{ product.name }}</span>
          <strong>{{ product.soldCount }}</strong>
        </div>
      </div>
    </article>

    <article class="admin-card dashboard-card">
      <div class="card-head">
        <div>
          <span class="kicker">Stock</span>
          <h2>库存预警</h2>
        </div>
      </div>
      <div class="warning-list">
        <div v-for="product in stats.stockWarningProducts || []" :key="product.id" class="warning-row">
          <span>{{ product.name }}</span>
          <strong>{{ product.stock }} 件</strong>
        </div>
      </div>
    </article>
  </section>

  <section class="admin-card dashboard-card">
    <div class="card-head">
      <div>
        <span class="kicker">Recent</span>
        <h2>最近订单</h2>
      </div>
    </div>
    <el-table :data="stats.recentOrders || []" stripe>
      <el-table-column prop="orderNo" label="订单号" min-width="220" />
      <el-table-column prop="amount" label="实付" width="120">
        <template #default="{ row }">￥{{ Number(row.amount || 0).toLocaleString() }}</template>
      </el-table-column>
      <el-table-column prop="statusText" label="状态" width="120" />
      <el-table-column prop="createdAt" label="创建时间" min-width="180" />
    </el-table>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { AlertTriangle, Banknote, MousePointerClick, PackageCheck, ReceiptText, TrendingUp, UsersRound } from 'lucide-vue-next';
import { adminApi } from '../../api/admin';

const stats = ref({ trend: [] });
const trend = computed(() => stats.value.trend || []);
const funnel = computed(() => stats.value.orderFunnel || []);
const maxSales = computed(() => Math.max(1, ...trend.value.map((item) => item.sales)));
const maxFunnel = computed(() => Math.max(1, ...funnel.value.map((item) => item.value)));
const cards = computed(() => [
  { label: '订单数', value: stats.value.orderCount || 0, hint: '累计订单', icon: ReceiptText },
  { label: '销售额', value: `￥${Number(stats.value.totalSales || 0).toLocaleString()}`, hint: '已支付订单', icon: Banknote },
  { label: '访客数', value: Number(stats.value.todayVisitors || 0).toLocaleString(), hint: '今日访问', icon: MousePointerClick },
  { label: '转化率', value: `${stats.value.conversionRate || 0}%`, hint: '访问到支付', icon: TrendingUp },
  { label: '客单价', value: `￥${Number(stats.value.averageOrderValue || 0).toLocaleString()}`, hint: '支付订单均值', icon: PackageCheck },
  { label: '用户数', value: stats.value.userCount || 0, hint: '注册用户', icon: UsersRound },
  { label: '待发货', value: stats.value.pendingShipment || 0, hint: '需处理', icon: PackageCheck },
  { label: '库存预警', value: stats.value.stockWarnings || 0, hint: '低库存商品', icon: AlertTriangle }
]);

onMounted(async () => {
  const res = await adminApi.overview();
  stats.value = res.data;
});
</script>
