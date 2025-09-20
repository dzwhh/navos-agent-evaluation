-- 检查并修复navos_user_info表的权限设置

-- 为anon角色授予基本权限
GRANT SELECT, INSERT ON navos_user_info TO anon;

-- 为authenticated角色授予完整权限
GRANT ALL PRIVILEGES ON navos_user_info TO authenticated;

-- 创建允许插入新用户的RLS策略
CREATE POLICY "Allow insert for all users" ON navos_user_info
  FOR INSERT
  WITH CHECK (true);

-- 创建允许查看所有用户的RLS策略
CREATE POLICY "Allow select for all users" ON navos_user_info
  FOR SELECT
  USING (true);

-- 创建允许更新用户的RLS策略
CREATE POLICY "Allow update for all users" ON navos_user_info
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 创建允许删除用户的RLS策略
CREATE POLICY "Allow delete for all users" ON navos_user_info
  FOR DELETE
  USING (true);