-- 插入admin用户用于测试权限控制
INSERT INTO navos_user_info (user_name, password, email, full_name, role, is_active)
VALUES ('admin', 'admin123', 'admin@example.com', '系统管理员', 'admin', true)
ON CONFLICT (user_name) DO UPDATE SET
  role = 'admin',
  email = 'admin@example.com',
  full_name = '系统管理员',
  is_active = true;

-- 确保有一个普通用户用于测试
INSERT INTO navos_user_info (user_name, password, email, full_name, role, is_active)
VALUES ('testuser', 'test123', 'test@example.com', '测试用户', 'user', true)
ON CONFLICT (user_name) DO UPDATE SET
  role = 'user',
  email = 'test@example.com',
  full_name = '测试用户',
  is_active = true;