-- 检查navos_test_result表的当前权限
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated') 
  AND table_name = 'navos_test_result' 
ORDER BY table_name, grantee;

-- 为anon角色授予SELECT权限（用于读取数据）
GRANT SELECT ON navos_test_result TO anon;

-- 为authenticated角色授予完整权限（用于插入、更新、删除数据）
GRANT ALL PRIVILEGES ON navos_test_result TO authenticated;

-- 再次检查权限是否设置成功
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated') 
  AND table_name = 'navos_test_result' 
ORDER BY table_name, grantee;