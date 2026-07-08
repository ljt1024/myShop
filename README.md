# MyShop 电商商城 MVP

基于 `商城开发计划.md` 落地的前后端分离电商项目骨架，包含：

- 商城前台：Vue 3 + Vite + Pinia + Vue Router
- 后台管理：Vue 3 + Element Plus
- API 服务：Node.js + Express + JWT
- 数据库脚本：MySQL 8.0 建表与种子数据
- 部署配置：Docker Compose + Nginx 示例

## 快速启动

```bash
npm install
npm run dev:api
npm run dev:mall
npm run dev:admin
```

本地地址：

- API: http://localhost:4000/health
- 商城前台: http://localhost:3000
- 管理后台: http://localhost:8080/admin/

演示账号：

- 商城用户：手机号 `13800138000`，验证码 `123456`
- 后台管理员：账号 `admin`，密码 `admin123456`

## 已实现的 MVP 功能

- 用户验证码登录、JWT 鉴权
- 首页轮播、分类入口、推荐商品
- 商品列表、搜索、排序、商品详情、SKU 选择
- 购物车增删改查、选择结算
- 创建订单、模拟支付、订单列表、取消订单
- 后台登录、经营仪表盘
- 后台商品新增、编辑、上下架、删除
- 后台订单列表与发货
- 后台用户启禁用、优惠券创建与列表

## 数据库初始化

SQL 文件位于 `backend/migrations/`：

```bash
mysql -uroot -p < backend/migrations/001_init_schema.sql
mysql -uroot -p < backend/migrations/002_seed.sql
```

当前 API 为便于前端联调使用内存数据；后续可将 `backend/src/models/store.js` 替换为 MySQL Repository 层。

## Docker

```bash
docker compose up --build
```

Compose 会启动 MySQL、Redis 和 API 服务。前端镜像已提供 Dockerfile，可按部署环境接入网关或单独构建。
