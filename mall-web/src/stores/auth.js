import { defineStore } from 'pinia';
import { mallApi } from '../api/mall';

export const useAuthStore = defineStore('mallAuth', {
  state: () => ({
    token: localStorage.getItem('mall_token') || '',
    user: JSON.parse(localStorage.getItem('mall_user') || 'null')
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token)
  },
  actions: {
    async login(phone, code = '123456') {
      const res = await mallApi.login({ phone, code });
      this.token = res.data.token;
      this.user = res.data.user;
      localStorage.setItem('mall_token', this.token);
      localStorage.setItem('mall_user', JSON.stringify(this.user));
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('mall_token');
      localStorage.removeItem('mall_user');
    }
  }
});
