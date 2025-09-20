-- 为navos_user_topic_mapping表配置完整的RLS策略和权限

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Enable read access for all users" ON navos_user_topic_mapping;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON navos_user_topic_mapping;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON navos_user_topic_mapping;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON navos_user_topic_mapping;

-- 创建新的RLS策略
-- 允许所有用户读取
CREATE POLICY "Enable read access for all users" ON navos_user_topic_mapping
    FOR SELECT USING (true);

-- 允许认证用户插入
CREATE POLICY "Enable insert for authenticated users only" ON navos_user_topic_mapping
    FOR INSERT WITH CHECK (true);

-- 允许认证用户更新
CREATE POLICY "Enable update for authenticated users only" ON navos_user_topic_mapping
    FOR UPDATE USING (true) WITH CHECK (true);

-- 允许认证用户删除
CREATE POLICY "Enable delete for authenticated users only" ON navos_user_topic_mapping
    FOR DELETE USING (true);

-- 确保表权限正确设置
GRANT ALL PRIVILEGES ON navos_user_topic_mapping TO authenticated;
GRANT SELECT ON navos_user_topic_mapping TO anon;

-- 确保序列权限（用于自增ID）
GRANT USAGE, SELECT ON SEQUENCE navos_user_topic_mapping_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE navos_user_topic_mapping_id_seq TO anon;