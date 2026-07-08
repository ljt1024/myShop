<template>
  <section class="admin-card">
    <div class="card-head">
      <div class="filter-row">
        <el-input v-model="keyword" placeholder="优惠券名称" clearable />
        <el-button @click="fetchCoupons">查询</el-button>
      </div>
      <el-button type="primary" :disabled="!auth.canWrite" @click="drawer = true">创建优惠券</el-button>
    </div>
    <el-table :data="filteredCoupons" stripe>
      <el-table-column prop="name" label="名称" />
      <el-table-column label="类型" width="120">
        <template #default="{ row }">{{ row.type === 1 ? '满减券' : row.type === 2 ? '折扣券' : '无门槛券' }}</template>
      </el-table-column>
      <el-table-column prop="value" label="面值/折扣" width="130" />
      <el-table-column prop="minAmount" label="门槛" width="120" />
      <el-table-column prop="remainCount" label="剩余" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'info'">{{ row.status ? '生效' : '停用' }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </section>

  <el-drawer v-model="drawer" title="创建优惠券" size="420px">
    <el-form :model="form" label-position="top">
      <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
      <el-form-item label="类型">
        <el-select v-model="form.type">
          <el-option label="满减券" :value="1" />
          <el-option label="折扣券" :value="2" />
          <el-option label="无门槛券" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="优惠值"><el-input-number v-model="form.value" :min="0" /></el-form-item>
      <el-form-item label="使用门槛"><el-input-number v-model="form.minAmount" :min="0" /></el-form-item>
      <el-form-item label="发放数量"><el-input-number v-model="form.remainCount" :min="1" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawer = false">取消</el-button>
      <el-button type="primary" :disabled="!auth.canWrite" @click="save">创建</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { adminApi } from '../../api/admin';
import { useAdminAuthStore } from '../../stores/auth';

const auth = useAdminAuthStore();
const coupons = ref([]);
const keyword = ref('');
const drawer = ref(false);
const form = reactive({ name: '', type: 1, value: 40, minAmount: 300, remainCount: 100 });
const filteredCoupons = computed(() => {
  const key = keyword.value.trim().toLowerCase();
  return key ? coupons.value.filter((item) => item.name.toLowerCase().includes(key)) : coupons.value;
});

async function fetchCoupons() {
  const res = await adminApi.coupons();
  coupons.value = res.data;
}

async function save() {
  if (!auth.canWrite) return;
  await adminApi.createCoupon(form);
  Object.assign(form, { name: '', type: 1, value: 40, minAmount: 300, remainCount: 100 });
  drawer.value = false;
  await fetchCoupons();
}

onMounted(fetchCoupons);
</script>
