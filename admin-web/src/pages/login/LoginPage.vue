<template>
  <main class="login-page">
    <section class="login-panel">
      <div>
        <span class="kicker">MyShop Admin</span>
        <h1>登录运营后台</h1>
        <p>演示账号：admin / admin123456</p>
      </div>
      <el-form :model="form" label-position="top" @submit.prevent="submit">
        <el-form-item label="账号">
          <el-input v-model="form.username" size="large" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" size="large" show-password />
        </el-form-item>
        <el-button type="primary" size="large" native-type="submit" :loading="loading">进入后台</el-button>
      </el-form>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminAuthStore } from '../../stores/auth';

const router = useRouter();
const auth = useAdminAuthStore();
const loading = ref(false);
const form = reactive({ username: 'admin', password: 'admin123456' });

async function submit() {
  loading.value = true;
  try {
    await auth.login(form);
    router.push('/');
  } finally {
    loading.value = false;
  }
}
</script>
