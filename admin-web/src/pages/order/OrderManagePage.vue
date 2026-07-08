<template>
  <section class="admin-card">
    <div class="card-head">
      <el-select v-model="status" clearable placeholder="订单状态" @change="fetchOrders">
        <el-option label="待支付" :value="10" />
        <el-option label="待发货" :value="20" />
        <el-option label="待收货" :value="30" />
        <el-option label="已完成" :value="40" />
        <el-option label="已取消" :value="50" />
      </el-select>
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
          <el-button v-if="row.status === 20" type="primary" link @click="ship(row)">发货</el-button>
          <el-button v-else link disabled>无操作</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { adminApi } from '../../api/admin';

const orders = ref([]);
const status = ref('');
const statusMap = { 10: '待支付', 20: '待发货', 30: '待收货', 40: '已完成', 50: '已取消' };
const tagType = { 10: 'warning', 20: 'primary', 30: 'success', 40: 'info', 50: 'danger' };

async function fetchOrders() {
  const res = await adminApi.orders({ status: status.value || undefined });
  orders.value = res.data;
}

async function ship(row) {
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
