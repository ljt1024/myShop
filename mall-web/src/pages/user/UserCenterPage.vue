<template>
  <section class="user-hero">
    <div>
      <span class="eyebrow">Account</span>
      <h1>{{ auth.user?.nickname || '演示用户' }}</h1>
      <p>{{ auth.user?.phone }}</p>
    </div>
    <button class="ghost-btn" @click="logout">退出登录</button>
  </section>

  <section class="profile-grid">
    <article class="profile-stat">
      <strong>{{ orders.length }}</strong>
      <span>订单</span>
    </article>
    <article class="profile-stat">
      <strong>{{ favorites.length }}</strong>
      <span>收藏</span>
    </article>
    <article class="profile-stat">
      <strong>{{ userCoupons.filter((item) => item.status === 0).length }}</strong>
      <span>可用券</span>
    </article>
    <article class="profile-stat">
      <strong>{{ addresses.length }}</strong>
      <span>地址</span>
    </article>
  </section>

  <section class="section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">Orders</span>
        <h2>我的订单</h2>
      </div>
    </div>

    <div v-if="orders.length" class="order-list">
      <article v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-card__head">
          <span>{{ order.orderNo }}</span>
          <strong>{{ statusMap[order.status] }}</strong>
        </div>
        <div class="mini-line" v-for="item in order.items" :key="item.id">
          <img :src="item.image" :alt="item.productName" />
          <span>{{ item.productName }} × {{ item.quantity }}</span>
          <strong>{{ money(item.subtotal) }}</strong>
        </div>
        <div class="order-card__foot">
          <span>实付 {{ money(order.payAmount) }}</span>
          <button v-if="order.status === 10" @click="pay(order.id)">去支付</button>
          <button v-if="order.status < 30" @click="cancel(order.id)">取消订单</button>
        </div>
      </article>
    </div>
    <div v-else class="empty-state">
      <PackageOpen :size="44" />
      <h2>还没有订单</h2>
      <RouterLink class="primary-btn" to="/products">去下第一单</RouterLink>
    </div>
  </section>

  <section class="section split-section">
    <div class="panel">
      <div class="section-heading compact-heading">
        <div>
          <span class="eyebrow">Address</span>
          <h2>收货地址</h2>
        </div>
      </div>
      <form class="address-form" @submit.prevent="saveAddress">
        <input v-model="addressForm.receiver" placeholder="收货人" />
        <input v-model="addressForm.phone" placeholder="手机号" />
        <input v-model="addressForm.province" placeholder="省份" />
        <input v-model="addressForm.city" placeholder="城市" />
        <input v-model="addressForm.district" placeholder="区县" />
        <input v-model="addressForm.detail" placeholder="详细地址" />
        <label class="inline-check">
          <input v-model="addressForm.isDefault" type="checkbox" />
          默认地址
        </label>
        <button class="primary-btn" type="submit">{{ addressForm.id ? '保存地址' : '新增地址' }}</button>
      </form>

      <div class="address-list">
        <article v-for="address in addresses" :key="address.id" class="address-manage-card">
          <div>
            <strong>{{ address.receiver }} {{ address.phone }}</strong>
            <p>{{ address.province }}{{ address.city }}{{ address.district }} {{ address.detail }}</p>
            <span v-if="address.isDefault">默认</span>
          </div>
          <div>
            <button @click="editAddress(address)">编辑</button>
            <button @click="removeAddress(address.id)">删除</button>
          </div>
        </article>
      </div>
    </div>

    <div class="panel">
      <div class="section-heading compact-heading">
        <div>
          <span class="eyebrow">Coupons</span>
          <h2>优惠券</h2>
        </div>
      </div>
      <div class="coupon-list">
        <article v-for="coupon in coupons" :key="coupon.id" class="coupon-card">
          <div>
            <strong>{{ coupon.name }}</strong>
            <span>满 {{ money(coupon.minAmount) }} 可用</span>
          </div>
          <button :disabled="coupon.received" @click="receive(coupon.id)">
            {{ coupon.received ? '已领取' : '领取' }}
          </button>
        </article>
      </div>

      <div class="section-heading compact-heading inner-heading">
        <div>
          <span class="eyebrow">Favorites</span>
          <h2>我的收藏</h2>
        </div>
      </div>
      <div class="favorite-list">
        <article v-for="favorite in favorites" :key="favorite.id" class="favorite-card">
          <RouterLink :to="`/products/${favorite.product.id}`">
            <img :src="favorite.product.image" :alt="favorite.product.name" />
            <span>{{ favorite.product.name }}</span>
          </RouterLink>
          <button @click="removeFavorite(favorite.id)">取消</button>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { PackageOpen } from 'lucide-vue-next';
import { mallApi } from '../../api/mall';
import { useAuthStore } from '../../stores/auth';
import { money } from '../../utils/money';

const router = useRouter();
const auth = useAuthStore();
const orders = ref([]);
const addresses = ref([]);
const coupons = ref([]);
const userCoupons = ref([]);
const favorites = ref([]);
const statusMap = { 10: '待支付', 20: '待发货', 30: '待收货', 40: '已完成', 50: '已取消' };
const addressForm = reactive({
  id: '',
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
});

async function fetchOrders() {
  const res = await mallApi.orders();
  orders.value = res.data;
}

async function fetchAddresses() {
  const res = await mallApi.addresses();
  addresses.value = res.data;
}

async function fetchCoupons() {
  const [couponRes, userCouponRes] = await Promise.all([mallApi.coupons(), mallApi.userCoupons()]);
  coupons.value = couponRes.data;
  userCoupons.value = userCouponRes.data;
}

async function fetchFavorites() {
  const res = await mallApi.favorites();
  favorites.value = res.data;
}

function resetAddressForm() {
  Object.assign(addressForm, {
    id: '',
    receiver: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false
  });
}

function editAddress(address) {
  Object.assign(addressForm, { ...address, isDefault: Boolean(address.isDefault) });
}

async function saveAddress() {
  if (addressForm.id) {
    await mallApi.updateAddress(addressForm.id, addressForm);
  } else {
    await mallApi.createAddress(addressForm);
  }
  resetAddressForm();
  await fetchAddresses();
}

async function removeAddress(id) {
  await mallApi.deleteAddress(id);
  await fetchAddresses();
}

async function receive(id) {
  await mallApi.receiveCoupon(id);
  await fetchCoupons();
}

async function removeFavorite(id) {
  await mallApi.removeFavorite(id);
  await fetchFavorites();
}

async function pay(id) {
  await mallApi.payOrder(id);
  await fetchOrders();
}

async function cancel(id) {
  await mallApi.cancelOrder(id);
  await fetchOrders();
}

function logout() {
  auth.logout();
  router.push('/');
}

onMounted(async () => {
  await Promise.all([fetchOrders(), fetchAddresses(), fetchCoupons(), fetchFavorites()]);
});
</script>
