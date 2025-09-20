-- 检查当前权限
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'navos_test_result' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 为anon角色授予SELECT权限（用于读取数据）
GRANT SELECT ON navos_test_result TO anon;

-- 为authenticated角色授予所有权限（用于登录用户的完整操作）
GRANT ALL PRIVILEGES ON navos_test_result TO authenticated;

-- 再次检查权限是否正确设置
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'navos_test_result' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;