<template>
  <section class="admin-card">
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
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { adminApi } from '../../api/admin';
import { useAdminAuthStore } from '../../stores/auth';

const auth = useAdminAuthStore();
const users = ref([]);

async function fetchUsers() {
  const res = await adminApi.users();
  users.value = res.data;
}

async function toggle(row) {
  if (!auth.canWrite) return;
  await adminApi.toggleUser(row.id);
  await fetchUsers();
}

onMounted(fetchUsers);
</script>
