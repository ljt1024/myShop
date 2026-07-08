import { defineStore } from 'pinia';
import { mallApi } from '../api/mall';

export const useCartStore = defineStore('mallCart', {
  state: () => ({
    items: [],
    totalAmount: 0
  }),
  getters: {
    count: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    selectedAmount: (state) => state.items.filter((item) => item.selected).reduce((sum, item) => sum + item.subtotal, 0)
  },
  actions: {
    async fetchCart() {
      const res = await mallApi.cart();
      this.items = res.data.items;
      this.totalAmount = res.data.totalAmount;
    },
    async add(payload) {
      await mallApi.addCart(payload);
      await this.fetchCart();
    },
    async update(id, payload) {
      await mallApi.updateCart(id, payload);
      await this.fetchCart();
    },
    async remove(id) {
      await mallApi.removeCart(id);
      await this.fetchCart();
    }
  }
});
