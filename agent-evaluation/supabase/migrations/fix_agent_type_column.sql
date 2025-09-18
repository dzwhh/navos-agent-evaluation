-- 修复 navos_test_result 表中的字段名拼写错误
-- 将 agent_tyle 重命名为 agent_type

ALTER TABLE navos_test_result 
RENAME COLUMN agent_tyle TO agent_type;

-- 确保 anon 和 authenticated 角色有正确的权限
GRANT SELECT, INSERT, UPDATE, DELETE ON navos_test_result TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON navos_test_result TO authenticated;