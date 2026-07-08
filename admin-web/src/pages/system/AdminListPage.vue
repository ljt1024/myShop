<template>
  <section class="admin-card">
    <div class="card-head">
      <div class="filter-row">
        <el-input v-model="keyword" placeholder="账号 / 昵称" clearable />
        <el-select v-model="roleCode" clearable placeholder="角色">
          <el-option v-for="role in roles" :key="role.code" :label="role.name" :value="role.code" />
        </el-select>
      </div>
      <el-button type="primary" :disabled="!auth.canManageRoles" @click="openEditor()">新增管理员</el-button>
    </div>

    <el-table :data="filteredAdmins" stripe>
      <el-table-column prop="username" label="账号" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="roleName" label="角色" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="可写" width="100">
        <template #default="{ row }">
          <el-tag :type="row.permissions.includes('write') ? 'success' : 'info'">
            {{ row.permissions.includes('write') ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="!auth.canManageRoles" @click="openEditor(row)">编辑</el-button>
          <el-popconfirm title="确认删除该管理员？" @confirm="remove(row.id)">
            <template #reference>
              <el-button link type="danger" :disabled="!auth.canManageRoles || row.roleCode === 'owner'">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </section>

  <el-drawer v-model="drawer" :title="form.id ? '编辑管理员' : '新增管理员'" size="460px">
    <el-form :model="form" label-position="top">
      <el-form-item label="账号"><el-input v-model="form.username" /></el-form-item>
      <el-form-item :label="form.id ? '新密码（留空不修改）' : '密码'">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>
      <el-form-item label="昵称"><el-input v-model="form.nickname" /></el-form-item>
      <el-form-item label="角色">
        <el-select v-model="form.roleCode">
          <el-option v-for="role in roles" :key="role.code" :label="role.name" :value="role.code" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.status" :true-label="1" :false-label="0">启用账号</el-checkbox>
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
const admins = ref([]);
const roles = ref([]);
const keyword = ref('');
const roleCode = ref('');
const drawer = ref(false);
const form = reactive({ id: '', username: '', password: '', nickname: '', roleCode: 'viewer', status: 1 });
const filteredAdmins = computed(() => {
  const key = keyword.value.trim().toLowerCase();
  return admins.value.filter((item) => {
    const matchesKeyword = key ? `${item.username} ${item.nickname}`.toLowerCase().includes(key) : true;
    const matchesRole = roleCode.value ? item.roleCode === roleCode.value : true;
    return matchesKeyword && matchesRole;
  });
});

async function fetchAll() {
  const [roleRes, adminRes] = await Promise.all([adminApi.roles(), adminApi.admins()]);
  roles.value = roleRes.data;
  admins.value = adminRes.data;
}

function openEditor(row = null) {
  if (!auth.canManageRoles) return;
  Object.assign(form, row
    ? { id: row.id, username: row.username, password: '', nickname: row.nickname, roleCode: row.roleCode, status: row.status }
    : { id: '', username: '', password: '', nickname: '', roleCode: 'viewer', status: 1 });
  drawer.value = true;
}

async function save() {
  if (!auth.canManageRoles) return;
  const payload = { ...form };
  if (payload.id && !payload.password) delete payload.password;
  if (payload.id) await adminApi.updateAdmin(payload.id, payload);
  else await adminApi.createAdmin(payload);
  drawer.value = false;
  await fetchAll();
}

async function remove(id) {
  if (!auth.canManageRoles) return;
  await adminApi.deleteAdmin(id);
  await fetchAll();
}

onMounted(fetchAll);
</script>
