<template>
  <section class="page-head">
    <div>
      <span class="eyebrow">Catalog</span>
      <h1>商品列表</h1>
    </div>
    <p>{{ pagination.total }} 件商品正在售卖</p>
  </section>

  <section class="toolbar">
    <div class="toolbar-group">
      <button :class="{ active: !filters.categoryId }" @click="setCategory('')">全部</button>
      <button
        v-for="category in categories"
        :key="category.id"
        :class="{ active: Number(filters.categoryId) === category.id }"
        @click="setCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </div>
    <select v-model="filters.sort" @change="fetchProducts">
      <option value="default">综合排序</option>
      <option value="sales">销量优先</option>
      <option value="priceAsc">价格从低到高</option>
      <option value="priceDesc">价格从高到低</option>
      <option value="new">新品优先</option>
    </select>
  </section>

  <div class="product-grid">
    <ProductCard v-for="product in products" :key="product.id" :product="product" />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mallApi } from '../../api/mall';
import ProductCard from '../../components/ProductCard.vue';

const route = useRoute();
const router = useRouter();
const categories = ref([]);
const products = ref([]);
const pagination = ref({ total: 0 });
const filters = reactive({
  keyword: route.query.keyword || '',
  categoryId: route.query.categoryId || '',
  sort: 'default',
  page: 1,
  pageSize: 12
});

async function fetchProducts() {
  const res = await mallApi.products(filters);
  products.value = res.data.list;
  pagination.value = res.data.pagination;
}

function setCategory(categoryId) {
  filters.categoryId = categoryId;
  router.replace({ path: '/products', query: { ...route.query, categoryId: categoryId || undefined } });
  fetchProducts();
}

watch(
  () => route.query,
  (query) => {
    filters.keyword = query.keyword || '';
    filters.categoryId = query.categoryId || '';
    fetchProducts();
  }
);

onMounted(async () => {
  const categoryRes = await mallApi.categories();
  categories.value = categoryRes.data;
  await fetchProducts();
});
</script>
