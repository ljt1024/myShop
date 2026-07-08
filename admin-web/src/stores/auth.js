import { defineStore } from 'pinia';
import { adminApi } from '../api/admin';

export const useAdminAuthStore = defineStore('adminAuth', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    admin: JSON.parse(localStorage.getItem('admin_user') || 'null')
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    canWrite: (state) => Boolean(state.admin?.permissions?.includes('write')),
    canManageRoles: (state) => Boolean(state.admin?.permissions?.includes('role:manage'))
  },
  actions: {
    async login(payload) {
      const res = await adminApi.login(payload);
      this.token = res.data.token;
      this.admin = res.data.admin;
      localStorage.setItem('admin_token', this.token);
      localStorage.setItem('admin_user', JSON.stringify(this.admin));
    },
    logout() {
      this.token = '';
      this.admin = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  }
});
