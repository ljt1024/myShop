export const store = {
  users: [
    {
      id: 1,
      username: 'demo',
      phone: '13800138000',
      email: 'demo@myshop.local',
      nickname: '演示用户',
      avatar: '',
      status: 1,
      createdAt: '2026-07-08 09:00:00'
    }
  ],
  addresses: [
    {
      id: 1,
      userId: 1,
      receiver: '演示用户',
      phone: '13800138000',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: '世纪大道 100 号',
      isDefault: 1
    }
  ],
  categories: [
    { id: 1, parentId: 0, name: '数码家电', icon: 'Laptop', sortOrder: 1, isShow: 1 },
    { id: 2, parentId: 0, name: '生活方式', icon: 'Sofa', sortOrder: 2, isShow: 1 },
    { id: 3, parentId: 0, name: '户外运动', icon: 'Bike', sortOrder: 3, isShow: 1 },
    { id: 4, parentId: 0, name: '美食生鲜', icon: 'Cherry', sortOrder: 4, isShow: 1 }
  ],
  banners: [
    {
      id: 1,
      title: '夏日理想家电节',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80',
      type: 'category',
      targetId: '1',
      sortOrder: 1,
      isShow: 1
    },
    {
      id: 2,
      title: '城市轻户外上新',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
      type: 'category',
      targetId: '3',
      sortOrder: 2,
      isShow: 1
    }
  ],
  products: [
    {
      id: 101,
      categoryId: 1,
      name: 'Astra X1 智能手表',
      subTitle: '全天候健康监测，7 天长续航',
      price: 899,
      originalPrice: 1299,
      stock: 168,
      soldCount: 3240,
      viewCount: 8120,
      freight: 0,
      isOnSale: 1,
      isRecommend: 1,
      isNew: 1,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=80'
      ],
      params: { 材质: '铝合金机身', 防水: '5ATM', 续航: '7 天' },
      description: '轻薄表身与高精度传感器结合，适合日常通勤、运动训练和睡眠管理。',
      skus: [
        { id: 1001, specs: { 颜色: '曜石黑', 表带: '硅胶' }, price: 899, stock: 80, skuCode: 'ASTRA-X1-BLK' },
        { id: 1002, specs: { 颜色: '月雾银', 表带: '尼龙' }, price: 959, stock: 88, skuCode: 'ASTRA-X1-SLV' }
      ]
    },
    {
      id: 102,
      categoryId: 2,
      name: 'Mellow 模块沙发单椅',
      subTitle: '小户型友好，三档靠背角度',
      price: 1599,
      originalPrice: 2199,
      stock: 52,
      soldCount: 876,
      viewCount: 4260,
      freight: 30,
      isOnSale: 1,
      isRecommend: 1,
      isNew: 0,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=900&q=80'
      ],
      params: { 面料: '科技布', 填充: '高回弹海绵', 产地: '佛山' },
      description: '紧凑体量和柔和支撑兼具，适合客厅、书房与民宿空间。',
      skus: [
        { id: 1003, specs: { 颜色: '雾灰', 规格: '单人位' }, price: 1599, stock: 28, skuCode: 'MELLOW-GRY-1' },
        { id: 1004, specs: { 颜色: '松绿', 规格: '单人位' }, price: 1699, stock: 24, skuCode: 'MELLOW-GRN-1' }
      ]
    },
    {
      id: 103,
      categoryId: 3,
      name: 'TrailGo 城市折叠车',
      subTitle: '20 寸轻量车架，地铁通勤无压力',
      price: 2499,
      originalPrice: 2999,
      stock: 31,
      soldCount: 512,
      viewCount: 3188,
      freight: 0,
      isOnSale: 1,
      isRecommend: 1,
      isNew: 1,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=900&q=80',
      images: [
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80'
      ],
      params: { 车架: '铝合金', 变速: '7 速', 重量: '11.8kg' },
      description: '为城市通勤和周末短途设计，折叠迅速，骑行姿态舒展。',
      skus: [
        { id: 1005, specs: { 颜色: '苔原绿', 尺寸: '20 寸' }, price: 2499, stock: 15, skuCode: 'TRAILGO-GRN' },
        { id: 1006, specs: { 颜色: '钛灰', 尺寸: '20 寸' }, price: 2499, stock: 16, skuCode: 'TRAILGO-GRY' }
      ]
    },
    {
      id: 104,
      categoryId: 4,
      name: '山谷冷萃咖啡礼盒',
      subTitle: '低温慢萃，12 瓶装',
      price: 168,
      originalPrice: 238,
      stock: 420,
      soldCount: 6500,
      viewCount: 10900,
      freight: 0,
      isOnSale: 1,
      isRecommend: 1,
      isNew: 0,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80'
      ],
      params: { 产地: '云南', 容量: '280ml*12', 保质期: '90 天' },
      description: '精选高海拔咖啡豆，入口干净，带坚果和黑巧风味。',
      skus: [
        { id: 1007, specs: { 口味: '原味', 规格: '12 瓶' }, price: 168, stock: 210, skuCode: 'COLDBREW-ORG' },
        { id: 1008, specs: { 口味: '燕麦拿铁', 规格: '12 瓶' }, price: 188, stock: 210, skuCode: 'COLDBREW-OAT' }
      ]
    }
  ],
  carts: [],
  orders: [],
  coupons: [
    { id: 1, name: '新人满 300 减 40', type: 1, value: 40, minAmount: 300, remainCount: 500, status: 1 },
    { id: 2, name: '全场 95 折券', type: 2, value: 0.95, minAmount: 100, remainCount: 200, status: 1 }
  ]
};

export function nextId(list) {
  return Math.max(0, ...list.map((item) => Number(item.id) || 0)) + 1;
}
