<template>
  <section class="admin-card">
    <div class="card-head">
      <div class="filter-row">
        <el-input v-model="keyword" placeholder="角色名称 / 标识" clearable />
      </div>
      <el-button type="primary" :disabled="!auth.canManageRoles" @click="openEditor()">新增角色</el-button>
    </div>

    <el-table :data="filteredRoles" stripe>
      <el-table-column prop="name" label="角色" width="150" />
      <el-table-column prop="code" label="标识" width="130" />
      <el-table-column prop="description" label="说明" min-width="260" />
      <el-table-column label="权限">
        <template #default="{ row }">
          <el-tag v-for="permission in row.permissions" :key="permission" class="permission-tag">
            {{ permissionMap[permission] || permission }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="!auth.canManageRoles" @click="openEditor(row)">编辑</el-button>
          <el-popconfirm title="确认删除该角色？" @confirm="remove(row.code)">
            <template #reference>
              <el-button link type="danger" :disabled="!auth.canManageRoles || ['owner', 'viewer'].includes(row.code)">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </section>

  <el-drawer v-model="drawer" :title="form.persisted ? '编辑角色' : '新增角色'" size="460px">
    <el-form :model="form" label-position="top">
      <el-form-item label="角色标识"><el-input v-model="form.code" :disabled="form.persisted" /></el-form-item>
      <el-form-item label="角色名称"><el-input v-model="form.name" /></el-form-item>
      <el-form-item label="说明"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      <el-form-item label="权限">
        <el-checkbox-group v-model="form.permissions">
          <el-checkbox label="read">查看</el-checkbox>
          <el-checkbox label="write">修改</el-checkbox>
          <el-checkbox label="role:manage">角色管理</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawer = false">取消</el-button>
      <el-button type="primary" :disabled="!auth.canManageRoles" @click="save">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { adminApi } from '../../api/admin';
import { useAdminAuthStore } from '../../stores/auth';

const auth = useAdminAuthStore();
const roles = ref([]);
const keyword = ref('');
const drawer = ref(false);
const permissionMap = { read: '查看', write: '修改', 'role:manage': '角色管理' };
const form = reactive({ persisted: false, code: '', name: '', description: '', permissions: ['read'] });
const filteredRoles = computed(() => {
  const key = keyword.value.trim().toLowerCase();
  return key ? roles.value.filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(key)) : roles.value;
});

async function fetchRoles() {
  const res = await adminApi.roles();
  roles.value = res.data;
}

function openEditor(row = null) {
  if (!auth.canManageRoles) return;
  Object.assign(form, row
    ? { persisted: true, code: row.code, name: row.name, description: row.description, permissions: [...row.permissions] }
    : { persisted: false, code: '', name: '', description: '', permissions: ['read'] });
  drawer.value = true;
}

async function save() {
  if (!auth.canManageRoles) return;
  if (form.persisted) await adminApi.updateRole(form.code, form);
  else await adminApi.createRole(form);
  drawer.value = false;
  await fetchRoles();
}

async function remove(code) {
  if (!auth.canManageRoles) return;
  await adminApi.deleteRole(code);
  await fetchRoles();
}

onMounted(fetchRoles);
</script>
