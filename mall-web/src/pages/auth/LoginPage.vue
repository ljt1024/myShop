<template>
  <section class="auth-page">
    <div class="auth-copy">
      <span class="eyebrow">MyShop Account</span>
      <h1>{{ title }}</h1>
      <p>使用账号密码登录后，可同步购物车、管理收货地址、领取优惠券、收藏商品并发布评价。</p>
      <div class="auth-note">
        <strong>演示账号</strong>
        <span>demo / demo123456</span>
      </div>
    </div>

    <form class="auth-panel" @submit.prevent="submit">
      <div class="auth-tabs">
        <button type="button" :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</button>
        <button type="button" :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
        <button type="button" :class="{ active: mode === 'forgot' }" @click="switchMode('forgot')">忘记密码</button>
      </div>

      <label>
        <span>{{ mode === 'forgot' ? '账号 / 手机号 / 邮箱' : mode === 'login' ? '账号 / 手机号 / 邮箱' : '账号' }}</span>
        <input v-model="form.account" :placeholder="mode === 'register' ? '设置登录账号' : '输入账号、手机号或邮箱'" />
      </label>

      <template v-if="mode === 'register'">
        <label>
          <span>昵称</span>
          <input v-model="form.nickname" placeholder="用于展示在评价和用户中心" />
        </label>
        <label>
          <span>手机号</span>
          <input v-model="form.phone" placeholder="可选，用于找回账号" />
        </label>
        <label>
          <span>邮箱</span>
          <input v-model="form.email" placeholder="可选" />
        </label>
      </template>

      <label>
        <span>{{ mode === 'forgot' ? '新密码' : '密码' }}</span>
        <input v-model="form.password" type="password" placeholder="至少 6 位" />
      </label>

      <label v-if="mode !== 'login'">
        <span>确认密码</span>
        <input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" />
      </label>

      <p v-if="message" class="form-message">{{ message }}</p>
      <button class="primary-btn wide" type="submit" :disabled="loading">
        {{ loading ? '处理中...' : actionText }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const cart = useCartStore();
const mode = ref(route.query.mode === 'register' ? 'register' : 'login');
const loading = ref(false);
const message = ref('');
const form = reactive({
  account: 'demo',
  password: 'demo123456',
  confirmPassword: '',
  nickname: '',
  phone: '',
  email: ''
});

const title = computed(() => {
  if (mode.value === 'register') return '创建你的商城账号';
  if (mode.value === 'forgot') return '重置账号密码';
  return '欢迎回来';
});

const actionText = computed(() => {
  if (mode.value === 'register') return '注册并登录';
  if (mode.value === 'forgot') return '重置密码';
  return '登录';
});

function switchMode(nextMode) {
  mode.value = nextMode;
  message.value = '';
  if (nextMode === 'login') {
    Object.assign(form, { account: 'demo', password: 'demo123456', confirmPassword: '' });
  } else {
    Object.assign(form, { password: '', confirmPassword: '' });
  }
}

async function submit() {
  loading.value = true;
  message.value = '';
  try {
    if (mode.value === 'login') {
      await auth.login(form.account, form.password);
      await cart.fetchCart();
      router.push(route.query.redirect || '/user');
      return;
    }

    if (mode.value === 'register') {
      await auth.register({
        username: form.account,
        password: form.password,
        confirmPassword: form.confirmPassword,
        nickname: form.nickname,
        phone: form.phone,
        email: form.email
      });
      await cart.fetchCart();
      router.push(route.query.redirect || '/user');
      return;
    }

    await auth.forgotPassword({
      account: form.account,
      newPassword: form.password,
      confirmPassword: form.confirmPassword
    });
    switchMode('login');
    form.password = '';
    message.value = '密码已重置，请使用新密码登录';
  } catch (err) {
    message.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>
