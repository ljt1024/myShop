<template>
  <section class="admin-card">
    <div class="card-head">
      <div class="filter-row">
        <el-input v-model="keyword" placeholder="Banner 标题" clearable />
        <el-select v-model="showStatus" clearable placeholder="展示状态">
          <el-option label="展示" :value="1" />
          <el-option label="隐藏" :value="0" />
        </el-select>
      </div>
      <el-button type="primary" :disabled="!auth.canWrite" @click="openEditor()">新增 Banner</el-button>
    </div>
    <el-table :data="filteredBanners" stripe>
      <el-table-column label="图片" width="120">
        <template #default="{ row }">
          <img class="banner-thumb" :src="row.image" :alt="row.title" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="180" />
      <el-table-column prop="type" label="跳转类型" width="110" />
      <el-table-column prop="targetId" label="目标" width="110" />
      <el-table-column prop="sortOrder" label="排序" width="90" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isShow ? 'success' : 'info'">{{ row.isShow ? '展示' : '隐藏' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="190" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="!auth.canWrite" @click="openEditor(row)">编辑</el-button>
          <el-button link :disabled="!auth.canWrite" @click="toggle(row)">{{ row.isShow ? '隐藏' : '展示' }}</el-button>
          <el-popconfirm title="确认删除该 Banner？" @confirm="remove(row.id)">
            <template #reference>
              <el-button link type="danger" :disabled="!auth.canWrite">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </section>

  <el-drawer v-model="drawer" :title="form.id ? '编辑 Banner' : '新增 Banner'" size="520px">
    <el-form :model="form" label-position="top">
      <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
      <el-form-item label="图片 URL"><el-input v-model="form.image" /></el-form-item>
      <el-form-item label="跳转类型">
        <el-select v-model="form.type">
          <el-option label="商品" value="product" />
          <el-option label="分类" value="category" />
          <el-option label="外链" value="url" />
        </el-select>
      </el-form-item>
      <el-form-item label="目标 ID / URL"><el-input v-model="form.targetId" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="1" /></el-form-item>
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
import { computed, onMounted, reactive, ref } from 'vue';
import { adminApi } from '../../api/admin';
import { useAdminAuthStore } from '../../stores/auth';

const auth = useAdminAuthStore();
const banners = ref([]);
const keyword = ref('');
const showStatus = ref('');
const drawer = ref(false);
const form = reactive({ id: '', title: '', image: '', type: 'product', targetId: '', sortOrder: 1, isShow: 1 });
const filteredBanners = computed(() => {
  const key = keyword.value.trim().toLowerCase();
  return banners.value.filter((item) => {
    const matchesKeyword = key ? item.title.toLowerCase().includes(key) : true;
    const matchesStatus = showStatus.value === '' ? true : item.isShow === Number(showStatus.value);
    return matchesKeyword && matchesStatus;
  });
});

async function fetchBanners() {
  const res = await adminApi.banners();
  banners.value = res.data;
}

function openEditor(row = null) {
  if (!auth.canWrite) return;
  Object.assign(form, row || {
    id: '',
    title: '',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80',
    type: 'product',
    targetId: '',
    sortOrder: banners.value.length + 1,
    isShow: 1
  });
  drawer.value = true;
}

async function save() {
  if (!auth.canWrite) return;
  if (form.id) await adminApi.updateBanner(form.id, form);
  else await adminApi.createBanner(form);
  drawer.value = false;
  await fetchBanners();
}

async function toggle(row) {
  if (!auth.canWrite) return;
  await adminApi.updateBanner(row.id, { isShow: row.isShow ? 0 : 1 });
  await fetchBanners();
}

async function remove(id) {
  if (!auth.canWrite) return;
  await adminApi.deleteBanner(id);
  await fetchBanners();
}

onMounted(fetchBanners);
</script>
