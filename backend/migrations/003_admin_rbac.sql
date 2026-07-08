USE myshop;

CREATE TABLE IF NOT EXISTS admin_roles (
  code VARCHAR(32) PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  description VARCHAR(255),
  permissions JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(60),
  role_code VARCHAR(32) NOT NULL,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admins_role (role_code)
);

INSERT INTO admin_roles (code, name, description, permissions) VALUES
  ('owner', '超级管理员', '拥有后台所有查看与修改权限', JSON_ARRAY('read', 'write', 'role:manage')),
  ('operator', '运营人员', '可管理商品、订单、营销内容', JSON_ARRAY('read', 'write')),
  ('viewer', '游客', '只能查看后台数据，不能新增、编辑、删除或发货', JSON_ARRAY('read'))
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  permissions = VALUES(permissions);

INSERT INTO admins (id, username, password, nickname, role_code, status) VALUES
  (1, 'admin', 'admin123456', '商城运营管理员', 'owner', 1),
  (2, 'guest', 'guest123456', '只读游客', 'viewer', 1)
ON DUPLICATE KEY UPDATE
  nickname = VALUES(nickname),
  role_code = VALUES(role_code),
  status = VALUES(status);
