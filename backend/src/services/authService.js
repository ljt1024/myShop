import { env } from '../config/env.js';
import { nextId, store } from '../models/store.js';
import { signToken } from '../middlewares/auth.js';

export function sendCode(phone) {
  if (!phone) {
    const err = new Error('手机号不能为空');
    err.status = 400;
    throw err;
  }
  return { phone, code: '123456', expiresIn: 300 };
}

export function mallLogin({ phone, code }) {
  if (!phone || !code) {
    const err = new Error('手机号和验证码不能为空');
    err.status = 400;
    throw err;
  }

  if (code !== '123456') {
    const err = new Error('验证码错误，演示环境请输入 123456');
    err.status = 400;
    throw err;
  }

  let user = store.users.find((item) => item.phone === phone);
  if (!user) {
    user = {
      id: nextId(store.users),
      username: `u${phone.slice(-4)}`,
      phone,
      email: '',
      nickname: `用户${phone.slice(-4)}`,
      avatar: '',
      status: 1,
      createdAt: new Date().toISOString()
    };
    store.users.push(user);
  }

  return {
    token: signToken({ id: user.id, phone: user.phone, role: 'user' }),
    user
  };
}

export function getUserInfo(userId) {
  return store.users.find((user) => user.id === Number(userId));
}

export function adminLogin({ username, password }) {
  if (username !== env.adminUsername || password !== env.adminPassword) {
    const err = new Error('管理员账号或密码错误');
    err.status = 401;
    throw err;
  }

  return {
    token: signToken({ id: 1, username, role: 'admin' }),
    admin: {
      id: 1,
      username,
      nickname: '商城运营管理员',
      role: 'admin'
    }
  };
}
