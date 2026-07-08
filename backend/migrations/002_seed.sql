USE myshop;

INSERT INTO categories (id, parent_id, name, icon, sort_order, is_show) VALUES
  (1, 0, '数码家电', 'Laptop', 1, 1),
  (2, 0, '生活方式', 'Sofa', 2, 1),
  (3, 0, '户外运动', 'Bike', 3, 1),
  (4, 0, '美食生鲜', 'Cherry', 4, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (id, username, phone, email, nickname, status) VALUES
  (1, 'demo', '13800138000', 'demo@myshop.local', '演示用户', 1)
ON DUPLICATE KEY UPDATE nickname = VALUES(nickname);

INSERT INTO addresses (id, user_id, receiver, phone, province, city, district, detail, is_default) VALUES
  (1, 1, '演示用户', '13800138000', '上海市', '上海市', '浦东新区', '世纪大道 100 号', 1)
ON DUPLICATE KEY UPDATE receiver = VALUES(receiver);

INSERT INTO coupons (id, name, type, value, min_amount, total_count, remain_count, per_limit, status) VALUES
  (1, '新人满 300 减 40', 1, 40, 300, 500, 500, 1, 1),
  (2, '全场 95 折券', 2, 0.95, 100, 200, 200, 1, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);
