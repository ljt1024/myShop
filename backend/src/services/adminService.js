import { nextId, store } from '../models/store.js';
import { getProduct } from './catalogService.js';

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

export function listUsers() {
  return store.users.map(({ password, ...user }) => user);
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
