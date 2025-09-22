-- 验证数据修复结果

-- 1. 检查所有用户映射是否都有效
SELECT 'User Topic Mapping Verification:' as verification_type;
SELECT 
    utm.user_id,
    utm.user_name,
    utm.topic_id,
    utm.topic_name,
    tld.name as actual_topic_name,
    CASE 
        WHEN tld.id IS NOT NULL THEN '✅ 映射有效'
        ELSE '❌ 映射无效'
    END as mapping_status
FROM navos_user_topic_mapping utm
LEFT JOIN topic_list_data tld ON utm.topic_id = tld.id
ORDER BY utm.user_id;

-- 2. 检查每个topic下是否有题目数据
SELECT 'Topic Question Count:' as verification_type;
SELECT 
    tld.id as topic_id,
    tld.name as topic_name,
    COUNT(nqd.id) as question_count,
    CASE 
        WHEN COUNT(nqd.id) > 0 THEN '✅ 有题目数据'
        ELSE '❌ 无题目数据'
    END as data_status
FROM topic_list_data tld
LEFT JOIN navos_question_data nqd ON tld.id = nqd.topic_id
GROUP BY tld.id, tld.name
ORDER BY tld.id;

-- 3. 检查用户映射的topic是否都有对应的题目
SELECT 'User Access Verification:' as verification_type;
SELECT 
    utm.user_id,
    utm.user_name,
    utm.topic_id,
    utm.topic_name,
    COUNT(nqd.id) as available_questions,
    CASE 
        WHEN COUNT(nqd.id) > 0 THEN '✅ 可以做题'
        ELSE '❌ 无法做题'
    END as access_status
FROM navos_user_topic_mapping utm
LEFT JOIN navos_question_data nqd ON utm.topic_id = nqd.topic_id
GROUP BY utm.user_id, utm.user_name, utm.topic_id, utm.topic_name
ORDER BY utm.user_id;

-- 4. 总结修复结果
SELECT 'Fix Summary:' as verification_type;
SELECT 
    (SELECT COUNT(*) FROM navos_user_topic_mapping) as total_user_mappings,
    (SELECT COUNT(*) FROM navos_user_topic_mapping utm 
     INNER JOIN topic_list_data tld ON utm.topic_id = tld.id) as valid_mappings,
    (SELECT COUNT(*) FROM navos_user_topic_mapping utm 
     INNER JOIN topic_list_data tld ON utm.topic_id = tld.id
     INNER JOIN navos_question_data nqd ON tld.id = nqd.topic_id) as mappings_with_questions,
    CASE 
        WHEN (SELECT COUNT(*) FROM navos_user_topic_mapping) = 
             (SELECT COUNT(*) FROM navos_user_topic_mapping utm 
              INNER JOIN topic_list_data tld ON utm.topic_id = tld.id
              INNER JOIN navos_question_data nqd ON tld.id = nqd.topic_id)
        THEN '✅ 所有用户都可以正常做题'
        ELSE '❌ 仍有用户无法做题'
    END as overall_status;