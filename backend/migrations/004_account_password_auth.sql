USE myshop;

UPDATE users
SET password = 'demo123456'
WHERE username = 'demo' AND (password IS NULL OR password = '');

ALTER TABLE users
  MODIFY password VARCHAR(255) NOT NULL;

-- 003_admin_rbac.sql 已创建 admin_roles/admins；本脚本补充一个运营角色示例账号。
INSERT INTO admins (username, password, nickname, role_code, status) VALUES
  ('operator', 'operator123456', '运营人员', 'operator', 1)
ON DUPLICATE KEY UPDATE
  nickname = VALUES(nickname),
  role_code = VALUES(role_code),
  status = VALUES(status);
