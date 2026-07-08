<template>
  <section class="page-head">
    <div>
      <span class="eyebrow">Cart</span>
      <h1>购物车</h1>
    </div>
    <RouterLink class="ghost-btn" to="/products">继续购物</RouterLink>
  </section>

  <section v-if="cart.items.length" class="cart-list">
    <article v-for="item in cart.items" :key="item.id" class="cart-item">
      <input type="checkbox" :checked="item.selected" @change="cart.update(item.id, { selected: $event.target.checked })" />
      <img :src="item.product.image" :alt="item.product.name" />
      <div>
        <h3>{{ item.product.name }}</h3>
        <p>{{ Object.values(item.sku?.specs || {}).join(' · ') }}</p>
      </div>
      <strong>{{ money(item.sku?.price || item.product.price) }}</strong>
      <div class="qty-row compact">
        <button @click="cart.update(item.id, { quantity: item.quantity - 1 })">-</button>
        <span>{{ item.quantity }}</span>
        <button @click="cart.update(item.id, { quantity: item.quantity + 1 })">+</button>
      </div>
      <button class="icon-danger" @click="cart.remove(item.id)">
        <Trash2 :size="18" />
      </button>
    </article>
  </section>

  <section v-else class="empty-state">
    <ShoppingBag :size="44" />
    <h2>购物车还没有商品</h2>
    <RouterLink class="primary-btn" to="/products">去选购</RouterLink>
  </section>

  <aside class="checkout-bar" v-if="cart.items.length">
    <span>已选金额</span>
    <strong>{{ money(cart.selectedAmount) }}</strong>
    <RouterLink class="primary-btn" to="/checkout">去结算</RouterLink>
  </aside>
</template>

<script setup>
import { onMounted } from 'vue';
import { ShoppingBag, Trash2 } from 'lucide-vue-next';
import { useCartStore } from '../../stores/cart';
import { money } from '../../utils/money';

const cart = useCartStore();
onMounted(cart.fetchCart);
</script>
