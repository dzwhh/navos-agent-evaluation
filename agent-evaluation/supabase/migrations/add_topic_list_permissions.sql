-- 为topic_list_data表添加权限配置

-- 检查当前权限状态
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'topic_list_data' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 为anon角色授予基本读取权限
GRANT SELECT ON topic_list_data TO anon;

-- 为authenticated角色授予完整权限
GRANT ALL PRIVILEGES ON topic_list_data TO authenticated;

-- 创建RLS策略：允许所有用户读取数据
CREATE POLICY "Allow public read access" ON topic_list_data
  FOR SELECT
  USING (true);

-- 创建RLS策略：允许认证用户插入数据
CREATE POLICY "Allow authenticated insert" ON topic_list_data
  FOR INSERT
  WITH CHECK (true);

-- 创建RLS策略：允许认证用户更新数据
CREATE POLICY "Allow authenticated update" ON topic_list_data
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 创建RLS策略：允许认证用户删除数据
CREATE POLICY "Allow authenticated delete" ON topic_list_data
  FOR DELETE
  USING (true);

-- 验证权限设置
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'topic_list_data' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;