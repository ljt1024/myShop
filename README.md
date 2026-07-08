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

- 商城用户：账号 `demo`，密码 `demo123456`
- 商城注册：自定义账号 + 密码，也支持忘记密码重置
- 后台管理员：账号 `admin`，密码 `admin123456`
- 后台运营：账号 `operator`，密码 `operator123456`
- 后台游客：账号 `guest`，密码 `guest123456`，只读不可修改

## 已实现的 MVP 功能

- 用户验证码登录、JWT 鉴权
- 用户账号密码注册、登录、忘记密码重置
- 首页轮播、分类入口、推荐商品
- 商品列表、搜索、排序、商品详情、SKU 选择
- 商品收藏、商品评价、商家回复展示
- 购物车增删改查、选择结算
- 优惠券领取、结算选券、创建订单、模拟支付、订单列表、取消订单
- 收货地址新增、编辑、删除、默认地址
- 后台登录、经营仪表盘
- 后台商品新增、编辑、上下架、删除
- 后台商品分类新增、编辑、删除、展示状态管理
- 后台评论列表、评分/回复状态筛选、商家回复、删除评价
- 后台订单列表与发货
- 后台用户启禁用、优惠券创建与列表
- 后台首页 Banner 新增、编辑、展示/隐藏、删除
- 后台 RBAC 角色权限：支持新增/编辑角色、配置权限、新增管理员、分配角色；游客只能查看，写接口后端强制拦截
- 后台二级菜单：商品管理拆分商品列表/分类管理/评论管理，营销管理拆分优惠券/Banner，权限管理拆分角色/管理员
- 后台商品、订单、用户、分类、评论列表支持分页与筛选查询
- 后台左侧导航支持整体折叠/展开，二级菜单支持分组折叠/展开，并记住折叠状态
- 仪表盘增强：核心指标、销售趋势、订单漏斗、待办事项、商品排行、库存预警、最近订单

## 数据库初始化

SQL 文件位于 `backend/migrations/`：

```bash
mysql -uroot -p < backend/migrations/001_init_schema.sql
mysql -uroot -p < backend/migrations/002_seed.sql
mysql -uroot -p < backend/migrations/003_admin_rbac.sql
mysql -uroot -p < backend/migrations/004_account_password_auth.sql
```

当前 API 为便于前端联调使用内存数据；后续可将 `backend/src/models/store.js` 替换为 MySQL Repository 层。

## Docker

```bash
docker compose up --build
```

Compose 会启动 MySQL、Redis 和 API 服务。前端镜像已提供 Dockerfile，可按部署环境接入网关或单独构建。
