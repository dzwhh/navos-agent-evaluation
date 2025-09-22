-- 检查topic_list_data和navos_user_topic_mapping之间的数据关联问题

-- 1. 查看topic_list_data表中的所有数据
SELECT 
  id,
  name,
  creator,
  status,
  question_count,
  created_at
FROM topic_list_data
ORDER BY id;

-- 2. 查看navos_user_topic_mapping表中的所有数据
SELECT 
  id,
  user_id,
  user_name,
  topic_id,
  topic_name,
  created_at
FROM navos_user_topic_mapping
ORDER BY user_id, topic_id;

-- 3. 检查是否存在topic_list_data中的ID没有被navos_user_topic_mapping引用的情况
SELECT 
  tld.id as topic_list_id,
  tld.name as topic_list_name,
  tld.creator,
  tld.created_at as topic_created_at,
  CASE 
    WHEN nutm.topic_id IS NULL THEN '未被引用'
    ELSE '已被引用'
  END as reference_status
FROM topic_list_data tld
LEFT JOIN navos_user_topic_mapping nutm ON tld.id = nutm.topic_id
ORDER BY tld.id;

-- 4. 检查navos_user_topic_mapping中引用的topic_id是否在topic_list_data中存在
SELECT 
  nutm.id as mapping_id,
  nutm.user_id,
  nutm.user_name,
  nutm.topic_id,
  nutm.topic_name as mapping_topic_name,
  tld.name as actual_topic_name,
  CASE 
    WHEN tld.id IS NULL THEN '引用的topic_id不存在'
    ELSE '引用正确'
  END as validation_status
FROM navos_user_topic_mapping nutm
LEFT JOIN topic_list_data tld ON nutm.topic_id = tld.id
ORDER BY nutm.user_id, nutm.topic_id;

-- 5. 统计信息
SELECT 
  'topic_list_data总数' as table_name,
  COUNT(*) as count
FROM topic_list_data
UNION ALL
SELECT 
  'navos_user_topic_mapping总数' as table_name,
  COUNT(*) as count
FROM navos_user_topic_mapping
UNION ALL
SELECT 
  '未被引用的topic数量' as table_name,
  COUNT(*) as count
FROM topic_list_data tld
LEFT JOIN navos_user_topic_mapping nutm ON tld.id = nutm.topic_id
WHERE nutm.topic_id IS NULL;