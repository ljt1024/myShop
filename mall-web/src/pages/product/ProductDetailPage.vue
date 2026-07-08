<template>
  <section v-if="product" class="detail-layout">
    <div class="gallery">
      <img class="gallery-main" :src="activeImage" :alt="product.name" />
      <div class="thumbs">
        <button v-for="image in product.images" :key="image" :class="{ active: image === activeImage }" @click="activeImage = image">
          <img :src="image" :alt="product.name" />
        </button>
      </div>
    </div>

    <div class="detail-panel">
      <span class="eyebrow">评分 {{ product.rating }} · 已售 {{ product.soldCount }}</span>
      <h1>{{ product.name }}</h1>
      <p>{{ product.subTitle }}</p>
      <div class="price-row">
        <strong>{{ money(selectedSku?.price || product.price) }}</strong>
        <span>{{ money(product.originalPrice) }}</span>
      </div>

      <div class="sku-box">
        <label>选择规格</label>
        <button
          v-for="sku in product.skus"
          :key="sku.id"
          :class="{ active: sku.id === selectedSku?.id }"
          @click="selectedSku = sku"
        >
          {{ Object.values(sku.specs).join(' · ') }}
        </button>
      </div>

      <div class="qty-row">
        <label>数量</label>
        <button @click="quantity = Math.max(1, quantity - 1)">-</button>
        <span>{{ quantity }}</span>
        <button @click="quantity += 1">+</button>
      </div>

      <div class="detail-actions">
        <button class="primary-btn" @click="addToCart">加入购物车</button>
        <button class="ghost-btn" @click="buyNow">立即购买</button>
        <button class="ghost-btn" @click="toggleFavorite">
          <Heart :size="18" :fill="favorited ? 'currentColor' : 'none'" />
          {{ favorited ? '已收藏' : '收藏' }}
        </button>
      </div>

      <div class="params">
        <h2>商品参数</h2>
        <dl>
          <template v-for="(value, key) in product.params" :key="key">
            <dt>{{ key }}</dt>
            <dd>{{ value }}</dd>
          </template>
        </dl>
        <h2>商品详情</h2>
        <p>{{ product.description }}</p>
      </div>
    </div>
  </section>

  <section v-if="product" class="section review-section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">Reviews</span>
        <h2>累计评价</h2>
      </div>
      <span>{{ reviews.length }} 条</span>
    </div>

    <form class="review-form" @submit.prevent="submitReview">
      <div class="rating-picker">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          :class="{ active: reviewForm.rating >= star }"
          @click="reviewForm.rating = star"
        >
          ★
        </button>
      </div>
      <input v-model="reviewForm.content" placeholder="写下这件商品的使用体验" />
      <label class="inline-check">
        <input v-model="reviewForm.isAnonymous" type="checkbox" />
        匿名
      </label>
      <button class="primary-btn" type="submit">发布评价</button>
    </form>

    <div class="review-list">
      <article v-for="review in reviews" :key="review.id" class="review-card">
        <div>
          <strong>{{ review.user.nickname }}</strong>
          <span>{{ '★'.repeat(review.rating) }}</span>
        </div>
        <p>{{ review.content }}</p>
        <small v-if="review.reply">商家回复：{{ review.reply }}</small>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Heart } from 'lucide-vue-next';
import { mallApi } from '../../api/mall';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';
import { money } from '../../utils/money';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const cart = useCartStore();
const product = ref(null);
const activeImage = ref('');
const selectedSku = ref(null);
const quantity = ref(1);
const reviews = ref([]);
const favorited = ref(false);
const reviewForm = reactive({ rating: 5, content: '', isAnonymous: false });

async function ensureLogin() {
  if (!auth.isLoggedIn) {
    await auth.login('13800138000', '123456');
  }
}

async function addToCart() {
  await ensureLogin();
  await cart.add({ productId: product.value.id, skuId: selectedSku.value?.id, quantity: quantity.value });
}

async function buyNow() {
  await addToCart();
  router.push('/checkout');
}

async function fetchReviews() {
  const res = await mallApi.reviews(route.params.id);
  reviews.value = res.data;
}

async function fetchFavoriteStatus() {
  if (!auth.isLoggedIn) return;
  const res = await mallApi.favoriteStatus(route.params.id);
  favorited.value = res.data.favorited;
}

async function toggleFavorite() {
  await ensureLogin();
  if (favorited.value) {
    await mallApi.removeFavoriteByProduct(product.value.id);
  } else {
    await mallApi.addFavorite(product.value.id);
  }
  await fetchFavoriteStatus();
}

async function submitReview() {
  await ensureLogin();
  await mallApi.createReview(product.value.id, {
    rating: reviewForm.rating,
    content: reviewForm.content || '这件商品使用体验不错。',
    skuId: selectedSku.value?.id,
    isAnonymous: reviewForm.isAnonymous
  });
  Object.assign(reviewForm, { rating: 5, content: '', isAnonymous: false });
  await fetchReviews();
}

onMounted(async () => {
  const res = await mallApi.product(route.params.id);
  product.value = res.data;
  activeImage.value = product.value.images[0];
  selectedSku.value = product.value.skus[0];
  await Promise.all([fetchReviews(), fetchFavoriteStatus()]);
});
</script>
