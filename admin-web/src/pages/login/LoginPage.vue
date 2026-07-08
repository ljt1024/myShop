<template>
  <main class="login-page">
    <section class="login-panel">
      <div>
        <span class="kicker">MyShop Admin</span>
        <h1>登录运营后台</h1>
        <p>管理员：admin / admin123456；游客：guest / guest123456</p>
        <div class="login-presets">
          <button type="button" @click="usePreset('admin')">管理员登录</button>
          <button type="button" @click="usePreset('guest')">游客登录</button>
        </div>
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

function usePreset(type) {
  if (type === 'guest') {
    Object.assign(form, { username: 'guest', password: 'guest123456' });
  } else {
    Object.assign(form, { username: 'admin', password: 'admin123456' });
  }
}

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
