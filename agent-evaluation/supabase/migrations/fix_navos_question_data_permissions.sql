-- 检查当前权限
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'navos_question_data'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 为anon角色授予SELECT权限
GRANT SELECT ON navos_question_data TO anon;

-- 为authenticated角色授予所有权限
GRANT ALL PRIVILEGES ON navos_question_data TO authenticated;

-- 再次检查权限是否生效
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'navos_question_data'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 检查RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'navos_question_data';

-- 如果需要，创建允许所有用户读取的RLS策略
CREATE POLICY "Allow public read access" ON navos_question_data
    FOR SELECT
    TO public
    USING (true);

-- 允许认证用户进行所有操作
CREATE POLICY "Allow authenticated users full access" ON navos_question_data
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);