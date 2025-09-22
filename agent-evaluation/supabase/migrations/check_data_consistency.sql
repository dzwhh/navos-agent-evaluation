-- 检查数据一致性问题

-- 1. 查看navos_user_topic_mapping表中的所有用户映射数据
SELECT 
    id,
    user_id,
    user_name,
    topic_id,
    topic_name,
    created_at
FROM navos_user_topic_mapping
ORDER BY user_id, topic_id;

-- 2. 查看topic_list_data表中的所有数据
SELECT 
    id,
    name,
    description,
    created_at,
    updated_at
FROM topic_list_data
ORDER BY id;

-- 3. 检查用户映射的topic_id是否在topic_list_data表中存在
SELECT 
    utm.id as mapping_id,
    utm.user_id,
    utm.user_name,
    utm.topic_id,
    utm.topic_name,
    tld.id as topic_exists,
    tld.name as actual_topic_name,
    CASE 
        WHEN tld.id IS NULL THEN '映射的topic_id不存在'
        WHEN utm.topic_name != tld.name THEN '题集名称不匹配'
        ELSE '映射正常'
    END as status
FROM navos_user_topic_mapping utm
LEFT JOIN topic_list_data tld ON utm.topic_id = tld.id
ORDER BY utm.user_id;

-- 4. 查看navos_question_data表中的题目数据及其topic_id分布
SELECT 
    topic_id,
    COUNT(*) as question_count,
    MIN(id) as min_question_id,
    MAX(id) as max_question_id
FROM navos_question_data
GROUP BY topic_id
ORDER BY topic_id;

-- 5. 检查是否有题目的topic_id在topic_list_data中不存在
SELECT DISTINCT
    nqd.topic_id,
    COUNT(nqd.id) as question_count,
    tld.name as topic_name,
    CASE 
        WHEN tld.id IS NULL THEN '题目的topic_id在topic_list_data中不存在'
        ELSE '正常'
    END as status
FROM navos_question_data nqd
LEFT JOIN topic_list_data tld ON nqd.topic_id = tld.id
GROUP BY nqd.topic_id, tld.name, tld.id
ORDER BY nqd.topic_id;