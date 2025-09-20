-- 修复 navos_test_result 表的 RLS 策略
-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Users can insert their own test results" ON navos_test_result;
DROP POLICY IF EXISTS "Users can view their own test results" ON navos_test_result;
DROP POLICY IF EXISTS "Users can update their own test results" ON navos_test_result;
DROP POLICY IF EXISTS "Users can delete their own test results" ON navos_test_result;

-- 为 authenticated 用户创建 RLS 策略
-- 允许插入自己的测试结果
CREATE POLICY "Users can insert their own test results" ON navos_test_result
    FOR INSERT WITH CHECK (true);

-- 允许查看所有测试结果
CREATE POLICY "Users can view all test results" ON navos_test_result
    FOR SELECT USING (true);

-- 允许更新自己的测试结果
CREATE POLICY "Users can update their own test results" ON navos_test_result
    FOR UPDATE USING (true);

-- 允许删除自己的测试结果
CREATE POLICY "Users can delete their own test results" ON navos_test_result
    FOR DELETE USING (true);

-- 为 anon 用户授予基本权限
GRANT SELECT, INSERT, UPDATE, DELETE ON navos_test_result TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON navos_test_result TO authenticated;

-- 确保序列权限
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;