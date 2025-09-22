-- 修复用户topic映射数据一致性问题

-- 首先查看当前的映射状态
SELECT 'Current mapping status:' as info;
SELECT 
    utm.id,
    utm.user_id,
    utm.user_name,
    utm.topic_id,
    utm.topic_name,
    tld.id as actual_topic_id,
    tld.name as actual_topic_name
FROM navos_user_topic_mapping utm
LEFT JOIN topic_list_data tld ON utm.topic_id = tld.id;

-- 查看可用的topic_list_data
SELECT 'Available topics:' as info;
SELECT id, name, description FROM topic_list_data ORDER BY id;

-- 如果发现映射的topic_id不存在，更新为最新的topic_id
-- 假设最新的topic是id最大的那个
WITH latest_topic AS (
    SELECT id, name FROM topic_list_data ORDER BY id DESC LIMIT 1
)
UPDATE navos_user_topic_mapping 
SET 
    topic_id = (SELECT id FROM latest_topic),
    topic_name = (SELECT name FROM latest_topic)
WHERE topic_id NOT IN (SELECT id FROM topic_list_data);

-- 显示更新后的结果
SELECT 'Updated mapping status:' as info;
SELECT 
    utm.id,
    utm.user_id,
    utm.user_name,
    utm.topic_id,
    utm.topic_name,
    tld.name as actual_topic_name,
    CASE 
        WHEN tld.id IS NOT NULL THEN '映射正常'
        ELSE '仍有问题'
    END as status
FROM navos_user_topic_mapping utm
LEFT JOIN topic_list_data tld ON utm.topic_id = tld.id
ORDER BY utm.user_id;

-- 检查修复后是否还有问题
SELECT 
    COUNT(*) as problematic_mappings
FROM navos_user_topic_mapping utm
LEFT JOIN topic_list_data tld ON utm.topic_id = tld.id
WHERE tld.id IS NULL;