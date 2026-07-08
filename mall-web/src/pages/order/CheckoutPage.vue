<template>
  <section class="page-head">
    <div>
      <span class="eyebrow">Checkout</span>
      <h1>确认订单</h1>
    </div>
  </section>

  <section class="checkout-layout">
    <div class="checkout-main">
      <div class="panel">
        <h2>收货地址</h2>
        <label v-for="address in addresses" :key="address.id" class="address-card">
          <input v-model="addressId" type="radio" :value="address.id" />
          <span>
            <strong>{{ address.receiver }} {{ address.phone }}</strong>
            <small>{{ address.province }}{{ address.city }}{{ address.district }} {{ address.detail }}</small>
          </span>
        </label>
      </div>

      <div class="panel">
        <h2>商品清单</h2>
        <article v-for="item in selectedItems" :key="item.id" class="mini-line">
          <img :src="item.product.image" :alt="item.product.name" />
          <span>{{ item.product.name }} × {{ item.quantity }}</span>
          <strong>{{ money(item.subtotal) }}</strong>
        </article>
      </div>
    </div>

    <aside class="summary-panel">
      <h2>订单汇总</h2>
      <p><span>商品金额</span><strong>{{ money(cart.selectedAmount) }}</strong></p>
      <p><span>优惠</span><strong>-{{ money(discount) }}</strong></p>
      <p><span>运费</span><strong>{{ money(freight) }}</strong></p>
      <div class="summary-total">
        <span>应付</span>
        <strong>{{ money(payAmount) }}</strong>
      </div>
      <button class="primary-btn wide" @click="submitOrder">提交并模拟支付</button>
    </aside>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { mallApi } from '../../api/mall';
import { useCartStore } from '../../stores/cart';
import { money } from '../../utils/money';

const router = useRouter();
const cart = useCartStore();
const addresses = ref([]);
const addressId = ref('');
const selectedItems = computed(() => cart.items.filter((item) => item.selected));
const discount = computed(() => (cart.selectedAmount >= 300 ? 40 : 0));
const freight = computed(() => selectedItems.value.reduce((sum, item) => sum + Number(item.product.freight || 0), 0));
const payAmount = computed(() => cart.selectedAmount + freight.value - discount.value);

async function submitOrder() {
  const orderRes = await mallApi.createOrder({ addressId: addressId.value, payMethod: 'mock' });
  await mallApi.payOrder(orderRes.data.id);
  await cart.fetchCart();
  router.push('/user');
}

onMounted(async () => {
  await cart.fetchCart();
  const res = await mallApi.addresses();
  addresses.value = res.data;
  addressId.value = addresses.value[0]?.id || '';
});
</script>
