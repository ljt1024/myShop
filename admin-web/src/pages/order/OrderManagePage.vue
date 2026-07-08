<template>
  <section class="admin-card">
    <div class="card-head">
      <div class="filter-row">
        <el-input v-model="filters.orderNo" placeholder="订单号" clearable @keyup.enter="fetchOrders" />
        <el-input v-model="filters.receiver" placeholder="收货人" clearable @keyup.enter="fetchOrders" />
        <el-select v-model="filters.status" clearable placeholder="订单状态" @change="fetchOrders">
          <el-option label="待支付" :value="10" />
          <el-option label="待发货" :value="20" />
          <el-option label="待收货" :value="30" />
          <el-option label="已完成" :value="40" />
          <el-option label="已取消" :value="50" />
        </el-select>
      </div>
      <el-button @click="fetchOrders">刷新</el-button>
    </div>

    <el-table :data="orders" stripe>
      <el-table-column prop="orderNo" label="订单号" min-width="210" />
      <el-table-column label="商品" min-width="260">
        <template #default="{ row }">
          <span>{{ row.items.map((item) => `${item.productName}×${item.quantity}`).join('，') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="payAmount" label="实付" width="110">
        <template #default="{ row }">￥{{ row.payAmount }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="tagType[row.status]">{{ statusMap[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="170" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 20" type="primary" link :disabled="!auth.canWrite" @click="ship(row)">发货</el-button>
          <el-button v-else link disabled>无操作</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager-row">
      <el-pagination
        v-model:current-page="filters.page"
        v-model:page-size="filters.pageSize"
        layout="total, sizes, prev, pager, next"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        @current-change="fetchOrders"
        @size-change="fetchOrders"
      />
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { adminApi } from '../../api/admin';
import { useAdminAuthStore } from '../../stores/auth';

const auth = useAdminAuthStore();
const orders = ref([]);
const pagination = ref({ total: 0 });
const filters = reactive({ orderNo: '', receiver: '', status: '', page: 1, pageSize: 10 });
const statusMap = { 10: '待支付', 20: '待发货', 30: '待收货', 40: '已完成', 50: '已取消' };
const tagType = { 10: 'warning', 20: 'primary', 30: 'success', 40: 'info', 50: 'danger' };

async function fetchOrders() {
  const res = await adminApi.orders(filters);
  orders.value = res.data.list;
  pagination.value = res.data.pagination;
}

async function ship(row) {
  if (!auth.canWrite) return;
  const { value } = await ElMessageBox.prompt('请输入物流单号', '订单发货', {
    confirmButtonText: '发货',
    cancelButtonText: '取消',
    inputValue: `SF${Date.now()}`
  });
  await adminApi.shipOrder(row.id, { trackingNo: value });
  await fetchOrders();
}

onMounted(fetchOrders);
</script>
