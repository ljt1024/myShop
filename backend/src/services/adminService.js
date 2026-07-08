import { nextId, store } from '../models/store.js';
import { getProduct, paginate } from './catalogService.js';

export function createProduct(payload) {
  const product = {
    id: nextId(store.products),
    categoryId: Number(payload.categoryId || 1),
    name: payload.name,
    subTitle: payload.subTitle || '',
    price: Number(payload.price || 0),
    originalPrice: Number(payload.originalPrice || payload.price || 0),
    stock: Number(payload.stock || 0),
    soldCount: 0,
    viewCount: 0,
    freight: Number(payload.freight || 0),
    isOnSale: payload.isOnSale === undefined ? 1 : Number(payload.isOnSale),
    isRecommend: Number(payload.isRecommend || 0),
    isNew: Number(payload.isNew || 0),
    rating: 5,
    image: payload.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    images: payload.images?.length ? payload.images : [payload.image].filter(Boolean),
    params: payload.params || {},
    description: payload.description || '',
    skus: payload.skus?.length
      ? payload.skus
      : [
          {
            id: Date.now(),
            specs: { 规格: '默认' },
            price: Number(payload.price || 0),
            stock: Number(payload.stock || 0),
            skuCode: `SKU-${Date.now()}`
          }
        ]
  };

  if (!product.name) {
    const err = new Error('商品名称不能为空');
    err.status = 400;
    throw err;
  }

  store.products.unshift(product);
  return product;
}

export function updateProduct(id, payload) {
  const product = getProduct(id);
  if (!product) {
    const err = new Error('商品不存在');
    err.status = 404;
    throw err;
  }
  Object.assign(product, {
    ...payload,
    id: product.id,
    categoryId: payload.categoryId === undefined ? product.categoryId : Number(payload.categoryId),
    price: payload.price === undefined ? product.price : Number(payload.price),
    originalPrice: payload.originalPrice === undefined ? product.originalPrice : Number(payload.originalPrice),
    stock: payload.stock === undefined ? product.stock : Number(payload.stock),
    freight: payload.freight === undefined ? product.freight : Number(payload.freight)
  });
  return product;
}

export function deleteProduct(id) {
  const index = store.products.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    const err = new Error('商品不存在');
    err.status = 404;
    throw err;
  }
  store.products.splice(index, 1);
  return true;
}

export function listCategories(query = {}) {
  const { keyword = '', showStatus = '', page, pageSize } = query;
  const normalizedKeyword = String(keyword).trim().toLowerCase();
  let items = [...store.categories].sort((a, b) => a.sortOrder - b.sortOrder);

  if (normalizedKeyword) {
    items = items.filter((item) => item.name.toLowerCase().includes(normalizedKeyword));
  }

  if (showStatus !== '') {
    items = items.filter((item) => item.isShow === Number(showStatus));
  }

  return paginate(items, page, pageSize || 10);
}

export function createCategory(payload) {
  if (!payload.name) {
    const err = new Error('分类名称不能为空');
    err.status = 400;
    throw err;
  }

  const category = {
    id: nextId(store.categories),
    parentId: Number(payload.parentId || 0),
    name: payload.name,
    icon: payload.icon || 'Package',
    sortOrder: Number(payload.sortOrder || store.categories.length + 1),
    isShow: payload.isShow === undefined ? 1 : Number(payload.isShow)
  };
  store.categories.push(category);
  return category;
}

export function updateCategory(id, payload) {
  const category = store.categories.find((item) => item.id === Number(id));
  if (!category) {
    const err = new Error('分类不存在');
    err.status = 404;
    throw err;
  }

  Object.assign(category, {
    ...payload,
    id: category.id,
    parentId: payload.parentId === undefined ? category.parentId : Number(payload.parentId),
    sortOrder: payload.sortOrder === undefined ? category.sortOrder : Number(payload.sortOrder),
    isShow: payload.isShow === undefined ? category.isShow : Number(payload.isShow)
  });
  return category;
}

export function deleteCategory(id) {
  const categoryId = Number(id);
  if (store.products.some((product) => product.categoryId === categoryId)) {
    const err = new Error('该分类下存在商品，不能删除');
    err.status = 400;
    throw err;
  }

  const index = store.categories.findIndex((item) => item.id === categoryId);
  if (index === -1) {
    const err = new Error('分类不存在');
    err.status = 404;
    throw err;
  }
  store.categories.splice(index, 1);
  return true;
}

export function listUsers(query = {}) {
  const { keyword = '', status = '', page, pageSize } = query;
  const normalizedKeyword = String(keyword).trim().toLowerCase();
  let items = store.users.map(({ password, ...user }) => user);

  if (normalizedKeyword) {
    items = items.filter((user) => {
      return `${user.username} ${user.nickname} ${user.phone} ${user.email}`.toLowerCase().includes(normalizedKeyword);
    });
  }

  if (status !== '') {
    items = items.filter((user) => user.status === Number(status));
  }

  return paginate(items, page, pageSize || 10);
}

export function listRoles() {
  return store.roles;
}

export function createRole(payload) {
  const code = String(payload.code || '').trim();
  if (!code || !payload.name) {
    const err = new Error('角色标识和名称不能为空');
    err.status = 400;
    throw err;
  }

  if (store.roles.some((item) => item.code === code)) {
    const err = new Error('角色标识已存在');
    err.status = 400;
    throw err;
  }

  const role = {
    code,
    name: payload.name,
    description: payload.description || '',
    permissions: Array.isArray(payload.permissions) && payload.permissions.length ? payload.permissions : ['read']
  };
  store.roles.push(role);
  return role;
}

export function updateRole(code, payload) {
  const role = store.roles.find((item) => item.code === code);
  if (!role) {
    const err = new Error('角色不存在');
    err.status = 404;
    throw err;
  }

  Object.assign(role, {
    code: role.code,
    name: payload.name || role.name,
    description: payload.description === undefined ? role.description : payload.description,
    permissions: Array.isArray(payload.permissions) && payload.permissions.length ? payload.permissions : role.permissions
  });
  return role;
}

export function deleteRole(code) {
  if (['owner', 'viewer'].includes(code)) {
    const err = new Error('内置角色不可删除');
    err.status = 400;
    throw err;
  }

  if (store.admins.some((item) => item.roleCode === code)) {
    const err = new Error('该角色已分配给管理员，不能删除');
    err.status = 400;
    throw err;
  }

  const index = store.roles.findIndex((item) => item.code === code);
  if (index === -1) {
    const err = new Error('角色不存在');
    err.status = 404;
    throw err;
  }
  store.roles.splice(index, 1);
  return true;
}

export function listAdmins() {
  return store.admins.map(({ password, ...admin }) => {
    const role = store.roles.find((item) => item.code === admin.roleCode);
    return {
      ...admin,
      roleName: role?.name || admin.roleCode,
      permissions: role?.permissions || []
    };
  });
}

export function listAdminReviews(query = {}) {
  const { keyword = '', rating = '', replyStatus = '', page, pageSize } = query;
  const normalizedKeyword = String(keyword).trim().toLowerCase();
  let items = store.reviews.map((review) => {
    const product = getProduct(review.productId);
    const user = store.users.find((item) => item.id === review.userId);
    return {
      ...review,
      productName: product?.name || '未知商品',
      userName: review.isAnonymous ? '匿名用户' : user?.nickname || user?.username || '商城用户'
    };
  });

  if (normalizedKeyword) {
    items = items.filter((review) => {
      return `${review.productName} ${review.userName} ${review.content}`.toLowerCase().includes(normalizedKeyword);
    });
  }

  if (rating !== '') {
    items = items.filter((review) => review.rating === Number(rating));
  }

  if (replyStatus !== '') {
    items = items.filter((review) => (replyStatus === 'replied' ? Boolean(review.reply) : !review.reply));
  }

  return paginate(items.sort((a, b) => b.id - a.id), page, pageSize || 10);
}

export function replyReview(id, payload = {}) {
  const review = store.reviews.find((item) => item.id === Number(id));
  if (!review) {
    const err = new Error('评价不存在');
    err.status = 404;
    throw err;
  }
  review.reply = payload.reply || '';
  review.replyAt = review.reply ? new Date().toISOString() : null;
  return review;
}

export function deleteReview(id) {
  const index = store.reviews.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    const err = new Error('评价不存在');
    err.status = 404;
    throw err;
  }
  store.reviews.splice(index, 1);
  return true;
}

export function createAdmin(payload) {
  if (!payload.username || !payload.password || !payload.roleCode) {
    const err = new Error('管理员账号、密码和角色不能为空');
    err.status = 400;
    throw err;
  }

  if (store.admins.some((item) => item.username === payload.username)) {
    const err = new Error('管理员账号已存在');
    err.status = 400;
    throw err;
  }

  if (!store.roles.some((item) => item.code === payload.roleCode)) {
    const err = new Error('角色不存在');
    err.status = 400;
    throw err;
  }

  const admin = {
    id: nextId(store.admins),
    username: payload.username,
    password: payload.password,
    nickname: payload.nickname || payload.username,
    roleCode: payload.roleCode,
    status: payload.status === undefined ? 1 : Number(payload.status)
  };
  store.admins.push(admin);
  return listAdmins().find((item) => item.id === admin.id);
}

export function updateAdmin(id, payload) {
  const admin = store.admins.find((item) => item.id === Number(id));
  if (!admin) {
    const err = new Error('管理员不存在');
    err.status = 404;
    throw err;
  }

  if (payload.roleCode && !store.roles.some((item) => item.code === payload.roleCode)) {
    const err = new Error('角色不存在');
    err.status = 400;
    throw err;
  }

  Object.assign(admin, {
    id: admin.id,
    username: payload.username || admin.username,
    password: payload.password || admin.password,
    nickname: payload.nickname === undefined ? admin.nickname : payload.nickname,
    roleCode: payload.roleCode || admin.roleCode,
    status: payload.status === undefined ? admin.status : Number(payload.status)
  });
  return listAdmins().find((item) => item.id === admin.id);
}

export function deleteAdmin(id) {
  const admin = store.admins.find((item) => item.id === Number(id));
  if (!admin) {
    const err = new Error('管理员不存在');
    err.status = 404;
    throw err;
  }

  if (admin.roleCode === 'owner') {
    const ownerCount = store.admins.filter((item) => item.roleCode === 'owner' && item.status).length;
    if (ownerCount <= 1) {
      const err = new Error('至少保留一个启用的超级管理员');
      err.status = 400;
      throw err;
    }
  }

  store.admins = store.admins.filter((item) => item.id !== Number(id));
  return true;
}

export function toggleUserStatus(id) {
  const user = store.users.find((item) => item.id === Number(id));
  if (!user) {
    const err = new Error('用户不存在');
    err.status = 404;
    throw err;
  }
  user.status = user.status ? 0 : 1;
  return user;
}

export function listCoupons() {
  return store.coupons;
}

export function createCoupon(payload) {
  const coupon = {
    id: nextId(store.coupons),
    name: payload.name,
    type: Number(payload.type || 1),
    value: Number(payload.value || 0),
    minAmount: Number(payload.minAmount || 0),
    remainCount: Number(payload.remainCount || payload.totalCount || 0),
    status: 1
  };

  if (!coupon.name) {
    const err = new Error('优惠券名称不能为空');
    err.status = 400;
    throw err;
  }

  store.coupons.unshift(coupon);
  return coupon;
}

export function listBanners() {
  return [...store.banners].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function createBanner(payload) {
  const banner = {
    id: nextId(store.banners),
    title: payload.title,
    image: payload.image,
    type: payload.type || 'url',
    targetId: String(payload.targetId || ''),
    sortOrder: Number(payload.sortOrder || store.banners.length + 1),
    isShow: payload.isShow === undefined ? 1 : Number(payload.isShow)
  };

  if (!banner.title || !banner.image) {
    const err = new Error('Banner 标题和图片不能为空');
    err.status = 400;
    throw err;
  }

  store.banners.push(banner);
  return banner;
}

export function updateBanner(id, payload) {
  const banner = store.banners.find((item) => item.id === Number(id));
  if (!banner) {
    const err = new Error('Banner 不存在');
    err.status = 404;
    throw err;
  }
  Object.assign(banner, {
    ...payload,
    id: banner.id,
    sortOrder: payload.sortOrder === undefined ? banner.sortOrder : Number(payload.sortOrder),
    isShow: payload.isShow === undefined ? banner.isShow : Number(payload.isShow)
  });
  return banner;
}

export function deleteBanner(id) {
  const index = store.banners.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    const err = new Error('Banner 不存在');
    err.status = 404;
    throw err;
  }
  store.banners.splice(index, 1);
  return true;
}
