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

function findUserByAccount(account) {
  return store.users.find((item) => {
    return item.username === account || item.phone === account || item.email === account;
  });
}

function serializeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export function mallLogin({ account, username, phone, password }) {
  const loginAccount = account || username || phone;
  if (!loginAccount || !password) {
    const err = new Error('账号和密码不能为空');
    err.status = 400;
    throw err;
  }

  const user = findUserByAccount(loginAccount);
  if (!user) {
    const err = new Error('账号不存在，请先注册');
    err.status = 404;
    throw err;
  }

  if (user.password !== password) {
    const err = new Error('账号或密码错误');
    err.status = 401;
    throw err;
  }

  if (!user.status) {
    const err = new Error('账号已被禁用，请联系客服');
    err.status = 403;
    throw err;
  }

  return {
    token: signToken({ id: user.id, username: user.username, role: 'user' }),
    user: serializeUser(user)
  };
}

export function mallRegister({ username, password, confirmPassword, phone, nickname, email }) {
  if (!username || !password) {
    const err = new Error('账号和密码不能为空');
    err.status = 400;
    throw err;
  }

  if (password.length < 6) {
    const err = new Error('密码至少需要 6 位');
    err.status = 400;
    throw err;
  }

  if (confirmPassword && password !== confirmPassword) {
    const err = new Error('两次输入的密码不一致');
    err.status = 400;
    throw err;
  }

  const existing = store.users.find((item) => {
    return item.username === username || (phone && item.phone === phone) || (email && item.email === email);
  });
  if (existing) {
    const err = new Error('账号、手机号或邮箱已被注册');
    err.status = 400;
    throw err;
  }

  const user = {
    id: nextId(store.users),
    username,
    password,
    phone: phone || '',
    email: email || '',
    nickname: nickname || username,
    avatar: '',
    status: 1,
    createdAt: new Date().toISOString()
  };
  store.users.push(user);

  return {
    token: signToken({ id: user.id, username: user.username, role: 'user' }),
    user: serializeUser(user)
  };
}

export function forgotPassword({ account, newPassword, confirmPassword }) {
  if (!account || !newPassword) {
    const err = new Error('账号和新密码不能为空');
    err.status = 400;
    throw err;
  }

  if (newPassword.length < 6) {
    const err = new Error('新密码至少需要 6 位');
    err.status = 400;
    throw err;
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    const err = new Error('两次输入的密码不一致');
    err.status = 400;
    throw err;
  }

  const user = findUserByAccount(account);
  if (!user) {
    const err = new Error('账号不存在');
    err.status = 404;
    throw err;
  }

  user.password = newPassword;
  return true;
}

export function getUserInfo(userId) {
  return serializeUser(store.users.find((user) => user.id === Number(userId)));
}

export function adminLogin({ username, password }) {
  const admin = store.admins.find((item) => item.username === username && item.password === password);
  if (!admin) {
    const err = new Error('管理员账号或密码错误');
    err.status = 401;
    throw err;
  }

  if (!admin.status) {
    const err = new Error('管理员账号已停用');
    err.status = 403;
    throw err;
  }

  const role = store.roles.find((item) => item.code === admin.roleCode);

  return {
    token: signToken({
      id: admin.id,
      username,
      role: 'admin',
      adminRole: admin.roleCode,
      permissions: role?.permissions || ['read']
    }),
    admin: {
      id: admin.id,
      username,
      nickname: admin.nickname,
      role: admin.roleCode,
      roleName: role?.name || '未知角色',
      permissions: role?.permissions || ['read']
    }
  };
}
