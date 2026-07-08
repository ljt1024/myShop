<template>
  <section class="admin-card">
    <div class="card-head">
      <div class="filter-row">
        <el-input v-model="filters.keyword" placeholder="分类名称" clearable @keyup.enter="fetchCategories" />
        <el-select v-model="filters.showStatus" clearable placeholder="展示状态" @change="fetchCategories">
          <el-option label="展示" :value="1" />
          <el-option label="隐藏" :value="0" />
        </el-select>
        <el-button @click="fetchCategories">查询</el-button>
      </div>
      <el-button type="primary" :disabled="!auth.canWrite" @click="openEditor()">新增分类</el-button>
    </div>

    <el-table :data="categories" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="parentId" label="父级 ID" width="110" />
      <el-table-column prop="icon" label="图标" width="130" />
      <el-table-column prop="sortOrder" label="排序" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isShow ? 'success' : 'info'">{{ row.isShow ? '展示' : '隐藏' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="!auth.canWrite" @click="openEditor(row)">编辑</el-button>
          <el-popconfirm title="确认删除该分类？" @confirm="remove(row.id)">
            <template #reference>
              <el-button link type="danger" :disabled="!auth.canWrite">删除</el-button>
            </template>
          </el-popconfirm>
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
        @current-change="fetchCategories"
        @size-change="fetchCategories"
      />
    </div>
  </section>

  <el-drawer v-model="drawer" :title="form.id ? '编辑分类' : '新增分类'" size="420px">
    <el-form :model="form" label-position="top">
      <el-form-item label="分类名称"><el-input v-model="form.name" /></el-form-item>
      <el-form-item label="父级 ID"><el-input-number v-model="form.parentId" :min="0" /></el-form-item>
      <el-form-item label="图标"><el-input v-model="form.icon" placeholder="Laptop / Sofa / Bike" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" /></el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.isShow" :true-label="1" :false-label="0">前台展示</el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawer = false">取消</el-button>
      <el-button type="primary" :disabled="!auth.canWrite" @click="save">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { adminApi } from '../../api/admin';
import { useAdminAuthStore } from '../../stores/auth';

const auth = useAdminAuthStore();
const categories = ref([]);
const pagination = ref({ total: 0 });
const drawer = ref(false);
const filters = reactive({ keyword: '', showStatus: '', page: 1, pageSize: 10 });
const form = reactive({ id: '', name: '', parentId: 0, icon: 'Package', sortOrder: 1, isShow: 1 });

async function fetchCategories() {
  const res = await adminApi.categories(filters);
  categories.value = res.data.list;
  pagination.value = res.data.pagination;
}

function openEditor(row = null) {
  if (!auth.canWrite) return;
  Object.assign(form, row || { id: '', name: '', parentId: 0, icon: 'Package', sortOrder: categories.value.length + 1, isShow: 1 });
  drawer.value = true;
}

async function save() {
  if (!auth.canWrite) return;
  if (form.id) await adminApi.updateCategory(form.id, form);
  else await adminApi.createCategory(form);
  drawer.value = false;
  await fetchCategories();
}

async function remove(id) {
  if (!auth.canWrite) return;
  await adminApi.deleteCategory(id);
  await fetchCategories();
}

onMounted(fetchCategories);
</script>
