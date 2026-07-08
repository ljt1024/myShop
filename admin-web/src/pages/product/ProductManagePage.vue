<template>
  <section class="admin-card">
    <div class="card-head">
      <el-input v-model="keyword" placeholder="搜索商品名称" clearable @keyup.enter="fetchProducts" />
      <div class="card-actions">
        <el-button @click="fetchProducts">查询</el-button>
        <el-button type="primary" :disabled="!auth.canWrite" @click="openEditor()">新增商品</el-button>
      </div>
    </div>

    <el-table :data="products" stripe>
      <el-table-column label="商品" min-width="280">
        <template #default="{ row }">
          <div class="product-cell">
            <img :src="row.image" :alt="row.name" />
            <div>
              <strong>{{ row.name }}</strong>
              <small>{{ row.subTitle }}</small>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="售价" width="110">
        <template #default="{ row }">￥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column prop="soldCount" label="销量" width="100" />
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="row.isOnSale ? 'success' : 'info'">{{ row.isOnSale ? '上架' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="!auth.canWrite" @click="openEditor(row)">编辑</el-button>
          <el-button link :disabled="!auth.canWrite" @click="toggleSale(row)">{{ row.isOnSale ? '下架' : '上架' }}</el-button>
          <el-popconfirm title="确认删除该商品？" @confirm="remove(row.id)">
            <template #reference>
              <el-button link type="danger" :disabled="!auth.canWrite">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </section>

  <el-drawer v-model="drawer" :title="form.id ? '编辑商品' : '新增商品'" size="520px">
    <el-form :model="form" label-position="top">
      <el-form-item label="商品名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="副标题">
        <el-input v-model="form.subTitle" />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="form.categoryId">
          <el-option label="数码家电" :value="1" />
          <el-option label="生活方式" :value="2" />
          <el-option label="户外运动" :value="3" />
          <el-option label="美食生鲜" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="主图 URL">
        <el-input v-model="form.image" />
      </el-form-item>
      <div class="form-grid">
        <el-form-item label="售价">
          <el-input-number v-model="form.price" :min="0" />
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number v-model="form.originalPrice" :min="0" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="运费">
          <el-input-number v-model="form.freight" :min="0" />
        </el-form-item>
      </div>
      <el-form-item label="详情">
        <el-input v-model="form.description" type="textarea" :rows="4" />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.isRecommend" :true-label="1" :false-label="0">为你推荐</el-checkbox>
        <el-checkbox v-model="form.isNew" :true-label="1" :false-label="0">新品</el-checkbox>
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
import { ElMessage } from 'element-plus';
import { adminApi } from '../../api/admin';
import { useAdminAuthStore } from '../../stores/auth';

const auth = useAdminAuthStore();
const products = ref([]);
const keyword = ref('');
const drawer = ref(false);
const form = reactive({
  id: '',
  name: '',
  subTitle: '',
  categoryId: 1,
  image: '',
  price: 0,
  originalPrice: 0,
  stock: 0,
  freight: 0,
  isRecommend: 1,
  isNew: 0,
  description: ''
});

async function fetchProducts() {
  const res = await adminApi.products({ keyword: keyword.value, pageSize: 50 });
  products.value = res.data.list;
}

function openEditor(row = null) {
  if (!auth.canWrite) return;
  Object.assign(form, row || {
    id: '',
    name: '',
    subTitle: '',
    categoryId: 1,
    image: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    freight: 0,
    isRecommend: 1,
    isNew: 0,
    description: ''
  });
  drawer.value = true;
}

async function save() {
  if (!auth.canWrite) return;
  if (form.id) {
    await adminApi.updateProduct(form.id, form);
  } else {
    await adminApi.createProduct(form);
  }
  ElMessage.success('保存成功');
  drawer.value = false;
  await fetchProducts();
}

async function toggleSale(row) {
  if (!auth.canWrite) return;
  await adminApi.updateProduct(row.id, { isOnSale: row.isOnSale ? 0 : 1 });
  await fetchProducts();
}

async function remove(id) {
  if (!auth.canWrite) return;
  await adminApi.deleteProduct(id);
  await fetchProducts();
}

onMounted(fetchProducts);
</script>
