<template>
  <section class="admin-card">
    <div class="card-head">
      <div class="filter-row">
        <el-input v-model="filters.keyword" placeholder="用户名 / 昵称 / 手机 / 邮箱" clearable @keyup.enter="fetchUsers" />
        <el-select v-model="filters.status" clearable placeholder="状态" @change="fetchUsers">
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button @click="fetchUsers">查询</el-button>
      </div>
    </div>
    <el-table :data="users" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '正常' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="!auth.canWrite" @click="toggle(row)">{{ row.status ? '禁用' : '启用' }}</el-button>
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
        @current-change="fetchUsers"
        @size-change="fetchUsers"
      />
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { adminApi } from '../../api/admin';
import { useAdminAuthStore } from '../../stores/auth';

const auth = useAdminAuthStore();
const users = ref([]);
const pagination = ref({ total: 0 });
const filters = reactive({ keyword: '', status: '', page: 1, pageSize: 10 });

async function fetchUsers() {
  const res = await adminApi.users(filters);
  users.value = res.data.list;
  pagination.value = res.data.pagination;
}

async function toggle(row) {
  if (!auth.canWrite) return;
  await adminApi.toggleUser(row.id);
  await fetchUsers();
}

onMounted(fetchUsers);
</script>
