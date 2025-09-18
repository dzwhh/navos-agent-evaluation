-- 修复navos_test_result表的RLS权限问题
-- 允许匿名用户插入和查询数据

-- 删除现有的RLS策略（如果存在）
DROP POLICY IF EXISTS "Allow anonymous insert" ON navos_test_result;
DROP POLICY IF EXISTS "Allow anonymous select" ON navos_test_result;
DROP POLICY IF EXISTS "Allow public insert" ON navos_test_result;
DROP POLICY IF EXISTS "Allow public select" ON navos_test_result;

-- 创建允许匿名用户插入数据的策略
CREATE POLICY "Allow anonymous insert" ON navos_test_result
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- 创建允许匿名用户查询数据的策略
CREATE POLICY "Allow anonymous select" ON navos_test_result
    FOR SELECT
    TO anon
    USING (true);

-- 创建允许认证用户插入数据的策略
CREATE POLICY "Allow authenticated insert" ON navos_test_result
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 创建允许认证用户查询数据的策略
CREATE POLICY "Allow authenticated select" ON navos_test_result
    FOR SELECT
    TO authenticated
    USING (true);

-- 确保anon和authenticated角色有表的基本权限
GRANT SELECT, INSERT ON navos_test_result TO anon;
GRANT SELECT, INSERT ON navos_test_result TO authenticated;

-- 确保anon和authenticated角色可以使用序列（用于自增ID）
GRANT USAGE, SELECT ON SEQUENCE navos_test_result_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE navos_test_result_id_seq TO authenticated;