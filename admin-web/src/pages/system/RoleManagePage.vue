<template>
  <section class="admin-card">
    <div class="card-head">
      <div>
        <span class="kicker">RBAC</span>
        <h2>角色权限矩阵</h2>
      </div>
      <el-button type="primary" :disabled="!auth.canManageRoles" @click="openRoleEditor()">新增角色</el-button>
    </div>

    <el-table :data="roles" stripe>
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
          <el-button link type="primary" :disabled="!auth.canManageRoles" @click="openRoleEditor(row)">编辑</el-button>
          <el-popconfirm title="确认删除该角色？" @confirm="removeRole(row.code)">
            <template #reference>
              <el-button link type="danger" :disabled="!auth.canManageRoles || ['owner', 'viewer'].includes(row.code)">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </section>

  <section class="admin-card">
    <div class="card-head">
      <div>
        <span class="kicker">Accounts</span>
        <h2>后台管理员</h2>
      </div>
      <el-button type="primary" :disabled="!auth.canManageRoles" @click="openAdminEditor()">新增管理员</el-button>
    </div>

    <el-table :data="admins" stripe>
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
          <el-button link type="primary" :disabled="!auth.canManageRoles" @click="openAdminEditor(row)">编辑</el-button>
          <el-popconfirm title="确认删除该管理员？" @confirm="removeAdmin(row.id)">
            <template #reference>
              <el-button link type="danger" :disabled="!auth.canManageRoles || row.roleCode === 'owner'">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </section>

  <el-drawer v-model="roleDrawer" :title="roleForm.persisted ? '编辑角色' : '新增角色'" size="460px">
    <el-form :model="roleForm" label-position="top">
      <el-form-item label="角色标识">
        <el-input v-model="roleForm.code" :disabled="roleForm.persisted" placeholder="例如 finance" />
      </el-form-item>
      <el-form-item label="角色名称">
        <el-input v-model="roleForm.name" />
      </el-form-item>
      <el-form-item label="说明">
        <el-input v-model="roleForm.description" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="权限">
        <el-checkbox-group v-model="roleForm.permissions">
          <el-checkbox label="read">查看</el-checkbox>
          <el-checkbox label="write">修改</el-checkbox>
          <el-checkbox label="role:manage">角色管理</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="roleDrawer = false">取消</el-button>
      <el-button type="primary" :disabled="!auth.canManageRoles" @click="saveRole">保存</el-button>
    </template>
  </el-drawer>

  <el-drawer v-model="adminDrawer" :title="adminForm.id ? '编辑管理员' : '新增管理员'" size="460px">
    <el-form :model="adminForm" label-position="top">
      <el-form-item label="账号">
        <el-input v-model="adminForm.username" />
      </el-form-item>
      <el-form-item :label="adminForm.id ? '新密码（留空不修改）' : '密码'">
        <el-input v-model="adminForm.password" type="password" show-password />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="adminForm.nickname" />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="adminForm.roleCode">
          <el-option v-for="role in roles" :key="role.code" :label="role.name" :value="role.code" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="adminForm.status" :true-label="1" :false-label="0">启用账号</el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="adminDrawer = false">取消</el-button>
      <el-button type="primary" :disabled="!auth.canManageRoles" @click="saveAdmin">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { adminApi } from '../../api/admin';
import { useAdminAuthStore } from '../../stores/auth';

const auth = useAdminAuthStore();
const roles = ref([]);
const admins = ref([]);
const roleDrawer = ref(false);
const adminDrawer = ref(false);
const permissionMap = {
  read: '查看',
  write: '修改',
  'role:manage': '角色管理'
};
const roleForm = reactive({
  persisted: false,
  code: '',
  name: '',
  description: '',
  permissions: ['read']
});
const adminForm = reactive({
  id: '',
  username: '',
  password: '',
  nickname: '',
  roleCode: 'viewer',
  status: 1
});

async function fetchAll() {
  const [roleRes, adminRes] = await Promise.all([adminApi.roles(), adminApi.admins()]);
  roles.value = roleRes.data;
  admins.value = adminRes.data;
}

function openRoleEditor(row = null) {
  if (!auth.canManageRoles) return;
  Object.assign(roleForm, row
    ? { persisted: true, code: row.code, name: row.name, description: row.description, permissions: [...row.permissions] }
    : { persisted: false, code: '', name: '', description: '', permissions: ['read'] });
  roleDrawer.value = true;
}

async function saveRole() {
  if (!auth.canManageRoles) return;
  if (roleForm.persisted) {
    await adminApi.updateRole(roleForm.code, roleForm);
  } else {
    await adminApi.createRole(roleForm);
  }
  ElMessage.success('角色已保存');
  roleDrawer.value = false;
  await fetchAll();
}

async function removeRole(code) {
  if (!auth.canManageRoles) return;
  await adminApi.deleteRole(code);
  await fetchAll();
}

function openAdminEditor(row = null) {
  if (!auth.canManageRoles) return;
  Object.assign(adminForm, row
    ? { id: row.id, username: row.username, password: '', nickname: row.nickname, roleCode: row.roleCode, status: row.status }
    : { id: '', username: '', password: '', nickname: '', roleCode: 'viewer', status: 1 });
  adminDrawer.value = true;
}

async function saveAdmin() {
  if (!auth.canManageRoles) return;
  const payload = { ...adminForm };
  if (payload.id && !payload.password) delete payload.password;
  if (payload.id) {
    await adminApi.updateAdmin(payload.id, payload);
  } else {
    await adminApi.createAdmin(payload);
  }
  ElMessage.success('管理员已保存');
  adminDrawer.value = false;
  await fetchAll();
}

async function removeAdmin(id) {
  if (!auth.canManageRoles) return;
  await adminApi.deleteAdmin(id);
  await fetchAll();
}

onMounted(fetchAll);
</script>
