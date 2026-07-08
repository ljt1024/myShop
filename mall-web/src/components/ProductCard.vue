<template>
  <RouterLink class="product-card" :to="`/products/${product.id}`">
    <div class="product-card__image">
      <img :src="product.image" :alt="product.name" />
      <span v-if="product.isNew" class="badge">新品</span>
    </div>
    <div class="product-card__body">
      <h3>{{ product.name }}</h3>
      <p>{{ product.subTitle }}</p>
      <div class="product-card__meta">
        <strong>{{ money(product.price) }}</strong>
        <span>已售 {{ product.soldCount }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { money } from '../utils/money';

defineProps({
  product: {
    type: Object,
    required: true
  }
});
</script>
