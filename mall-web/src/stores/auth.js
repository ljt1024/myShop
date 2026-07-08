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
    async sendCode(phone) {
      return mallApi.sendCode(phone);
    },
    async login(account, password) {
      const res = await mallApi.login({ account, password });
      this.token = res.data.token;
      this.user = res.data.user;
      localStorage.setItem('mall_token', this.token);
      localStorage.setItem('mall_user', JSON.stringify(this.user));
    },
    async register(payload) {
      const res = await mallApi.register(payload);
      this.token = res.data.token;
      this.user = res.data.user;
      localStorage.setItem('mall_token', this.token);
      localStorage.setItem('mall_user', JSON.stringify(this.user));
    },
    async forgotPassword(payload) {
      return mallApi.forgotPassword(payload);
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('mall_token');
      localStorage.removeItem('mall_user');
    }
  }
});
