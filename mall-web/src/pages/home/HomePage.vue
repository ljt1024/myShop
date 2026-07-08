<template>
  <section class="home-hero">
    <div class="hero-copy">
      <span class="eyebrow">2026 夏季精选</span>
      <h1>把好商品放进更顺手的购物流里</h1>
      <p>从浏览、SKU、购物车到下单，MVP 已串通核心交易链路。</p>
      <div class="hero-actions">
        <RouterLink class="primary-btn" to="/products">逛全部商品</RouterLink>
        <RouterLink class="ghost-btn" to="/cart">查看购物车</RouterLink>
      </div>
    </div>
    <div class="hero-media" v-if="banners[0]">
      <img :src="banners[0].image" :alt="banners[0].title" />
      <div class="hero-caption">
        <span>Featured</span>
        <strong>{{ banners[0].title }}</strong>
      </div>
    </div>
  </section>

  <section class="section category-strip">
    <RouterLink
      v-for="category in categories"
      :key="category.id"
      :to="{ path: '/products', query: { categoryId: category.id } }"
      class="category-pill"
    >
      <component :is="iconMap[category.icon] || Package" :size="22" />
      <span>{{ category.name }}</span>
    </RouterLink>
  </section>

  <section class="section promo-band">
    <div>
      <span class="eyebrow">会员礼遇</span>
      <h2>新人满 300 立减 40</h2>
    </div>
    <RouterLink to="/products">去凑单</RouterLink>
  </section>

  <section class="section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">Recommend</span>
        <h2>为你推荐</h2>
      </div>
      <RouterLink to="/products">查看全部</RouterLink>
    </div>
    <div class="product-grid">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Bike, Cherry, Laptop, Package, Sofa } from 'lucide-vue-next';
import { mallApi } from '../../api/mall';
import ProductCard from '../../components/ProductCard.vue';

const banners = ref([]);
const categories = ref([]);
const products = ref([]);
const iconMap = { Bike, Cherry, Laptop, Package, Sofa };

onMounted(async () => {
  const [bannerRes, categoryRes, productRes] = await Promise.all([
    mallApi.banners(),
    mallApi.categories(),
    mallApi.recommend(8)
  ]);
  banners.value = bannerRes.data;
  categories.value = categoryRes.data;
  products.value = productRes.data;
});
</script>
