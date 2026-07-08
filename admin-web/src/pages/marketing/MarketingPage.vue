<template>
  <section class="admin-card">
    <div class="card-head">
      <div>
        <span class="kicker">Coupons</span>
        <h2>优惠券管理</h2>
      </div>
      <el-button type="primary" :disabled="!auth.canWrite" @click="drawer = true">创建优惠券</el-button>
    </div>
    <el-table :data="coupons" stripe>
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

  <section class="admin-card">
    <div class="card-head">
      <div>
        <span class="kicker">Banners</span>
        <h2>首页 Banner</h2>
      </div>
      <el-button type="primary" :disabled="!auth.canWrite" @click="openBannerEditor()">新增 Banner</el-button>
    </div>
    <el-table :data="banners" stripe>
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
          <el-button link type="primary" :disabled="!auth.canWrite" @click="openBannerEditor(row)">编辑</el-button>
          <el-button link :disabled="!auth.canWrite" @click="toggleBanner(row)">{{ row.isShow ? '隐藏' : '展示' }}</el-button>
          <el-popconfirm title="确认删除该 Banner？" @confirm="removeBanner(row.id)">
            <template #reference>
              <el-button link type="danger" :disabled="!auth.canWrite">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </section>

  <el-drawer v-model="drawer" title="创建优惠券" size="420px">
    <el-form :model="form" label-position="top">
      <el-form-item label="名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="form.type">
          <el-option label="满减券" :value="1" />
          <el-option label="折扣券" :value="2" />
          <el-option label="无门槛券" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="优惠值">
        <el-input-number v-model="form.value" :min="0" />
      </el-form-item>
      <el-form-item label="使用门槛">
        <el-input-number v-model="form.minAmount" :min="0" />
      </el-form-item>
      <el-form-item label="发放数量">
        <el-input-number v-model="form.remainCount" :min="1" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawer = false">取消</el-button>
      <el-button type="primary" :disabled="!auth.canWrite" @click="save">创建</el-button>
    </template>
  </el-drawer>

  <el-drawer v-model="bannerDrawer" :title="bannerForm.id ? '编辑 Banner' : '新增 Banner'" size="520px">
    <el-form :model="bannerForm" label-position="top">
      <el-form-item label="标题">
        <el-input v-model="bannerForm.title" />
      </el-form-item>
      <el-form-item label="图片 URL">
        <el-input v-model="bannerForm.image" />
      </el-form-item>
      <el-form-item label="跳转类型">
        <el-select v-model="bannerForm.type">
          <el-option label="商品" value="product" />
          <el-option label="分类" value="category" />
          <el-option label="外链" value="url" />
        </el-select>
      </el-form-item>
      <el-form-item label="目标 ID / URL">
        <el-input v-model="bannerForm.targetId" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="bannerForm.sortOrder" :min="1" />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="bannerForm.isShow" :true-label="1" :false-label="0">前台展示</el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="bannerDrawer = false">取消</el-button>
      <el-button type="primary" :disabled="!auth.canWrite" @click="saveBanner">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { adminApi } from '../../api/admin';
import { useAdminAuthStore } from '../../stores/auth';

const auth = useAdminAuthStore();
const coupons = ref([]);
const banners = ref([]);
const drawer = ref(false);
const bannerDrawer = ref(false);
const form = reactive({ name: '', type: 1, value: 40, minAmount: 300, remainCount: 100 });
const bannerForm = reactive({
  id: '',
  title: '',
  image: '',
  type: 'product',
  targetId: '',
  sortOrder: 1,
  isShow: 1
});

async function fetchCoupons() {
  const res = await adminApi.coupons();
  coupons.value = res.data;
}

async function fetchBanners() {
  const res = await adminApi.banners();
  banners.value = res.data;
}

async function save() {
  if (!auth.canWrite) return;
  await adminApi.createCoupon(form);
  Object.assign(form, { name: '', type: 1, value: 40, minAmount: 300, remainCount: 100 });
  drawer.value = false;
  await fetchCoupons();
}

function openBannerEditor(row = null) {
  if (!auth.canWrite) return;
  Object.assign(bannerForm, row || {
    id: '',
    title: '',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80',
    type: 'product',
    targetId: '',
    sortOrder: banners.value.length + 1,
    isShow: 1
  });
  bannerDrawer.value = true;
}

async function saveBanner() {
  if (!auth.canWrite) return;
  if (bannerForm.id) {
    await adminApi.updateBanner(bannerForm.id, bannerForm);
  } else {
    await adminApi.createBanner(bannerForm);
  }
  bannerDrawer.value = false;
  await fetchBanners();
}

async function toggleBanner(row) {
  if (!auth.canWrite) return;
  await adminApi.updateBanner(row.id, { isShow: row.isShow ? 0 : 1 });
  await fetchBanners();
}

async function removeBanner(id) {
  if (!auth.canWrite) return;
  await adminApi.deleteBanner(id);
  await fetchBanners();
}

onMounted(async () => {
  await Promise.all([fetchCoupons(), fetchBanners()]);
});
</script>
