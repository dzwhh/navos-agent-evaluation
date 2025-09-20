-- 检查表权限
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('topic_list_data', 'navos_user_topic_mapping')
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 检查RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('topic_list_data', 'navos_user_topic_mapping');

-- 为topic_list_data表添加权限（如果缺失）
GRANT SELECT ON topic_list_data TO anon;
GRANT SELECT ON topic_list_data TO authenticated;

-- 为navos_user_topic_mapping表添加权限（如果缺失）
GRANT ALL PRIVILEGES ON navos_user_topic_mapping TO authenticated;
GRANT SELECT ON navos_user_topic_mapping TO anon;

-- 为topic_list_data表创建RLS策略（允许所有用户读取）
CREATE POLICY "Allow read access to topic_list_data" ON topic_list_data
    FOR SELECT USING (true);

-- 为navos_user_topic_mapping表创建RLS策略（允许认证用户完全访问）
CREATE POLICY "Allow authenticated users full access to navos_user_topic_mapping" ON navos_user_topic_mapping
    FOR ALL USING (auth.role() = 'authenticated');

-- 为navos_user_topic_mapping表创建RLS策略（允许匿名用户读取）
CREATE POLICY "Allow read access to navos_user_topic_mapping" ON navos_user_topic_mapping
    FOR SELECT USING (true);