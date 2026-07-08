import { store } from '../models/store.js';

function paginate(items, page = 1, pageSize = 12) {
  const current = Math.max(1, Number(page) || 1);
  const size = Math.max(1, Math.min(100, Number(pageSize) || 12));
  const start = (current - 1) * size;
  return {
    list: items.slice(start, start + size),
    pagination: {
      page: current,
      pageSize: size,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / size))
    }
  };
}

export function getBanners() {
  return store.banners
    .filter((item) => item.isShow)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategories() {
  return store.categories
    .filter((item) => item.isShow)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getRecommendProducts(limit = 8) {
  return store.products
    .filter((item) => item.isOnSale && item.isRecommend)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, Number(limit) || 8);
}

export function listProducts(query = {}) {
  const { keyword = '', categoryId, sort = 'default', minPrice, maxPrice, page, pageSize } = query;
  const normalizedKeyword = String(keyword).trim().toLowerCase();

  let items = store.products.filter((product) => product.isOnSale);

  if (normalizedKeyword) {
    items = items.filter((product) => {
      return `${product.name} ${product.subTitle}`.toLowerCase().includes(normalizedKeyword);
    });
  }

  if (categoryId) {
    items = items.filter((product) => product.categoryId === Number(categoryId));
  }

  if (minPrice) {
    items = items.filter((product) => product.price >= Number(minPrice));
  }

  if (maxPrice) {
    items = items.filter((product) => product.price <= Number(maxPrice));
  }

  const sorters = {
    sales: (a, b) => b.soldCount - a.soldCount,
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    new: (a, b) => b.isNew - a.isNew || b.id - a.id,
    default: (a, b) => b.isRecommend - a.isRecommend || b.soldCount - a.soldCount
  };

  items = [...items].sort(sorters[sort] || sorters.default);
  return paginate(items, page, pageSize);
}

export function getProduct(id) {
  return store.products.find((product) => product.id === Number(id));
}

export function getDashboardStats() {
  const paidOrders = store.orders.filter((order) => order.status >= 20 && order.status < 50);
  const totalSales = paidOrders.reduce((sum, order) => sum + order.payAmount, 0);
  const pendingShipment = store.orders.filter((order) => order.status === 20).length;
  const stockWarnings = store.products.filter((product) => product.stock < 40).length;

  return {
    orderCount: store.orders.length,
    totalSales,
    userCount: store.users.length,
    pendingShipment,
    stockWarnings,
    trend: [
      { day: '07-02', sales: 16800, orders: 43 },
      { day: '07-03', sales: 21400, orders: 58 },
      { day: '07-04', sales: 19300, orders: 49 },
      { day: '07-05', sales: 24800, orders: 62 },
      { day: '07-06', sales: 27600, orders: 71 },
      { day: '07-07', sales: 23200, orders: 55 },
      { day: '07-08', sales: Math.max(12800, totalSales), orders: Math.max(31, store.orders.length) }
    ]
  };
}

export function adminListProducts(query = {}) {
  const { keyword = '', page, pageSize } = query;
  const normalizedKeyword = String(keyword).trim().toLowerCase();
  const items = normalizedKeyword
    ? store.products.filter((product) => `${product.name} ${product.subTitle}`.toLowerCase().includes(normalizedKeyword))
    : store.products;
  return paginate(items, page, pageSize);
}
