-- 查询navos_question_data表的所有数据
SELECT 
  id,
  q_id,
  q_name,
  topic_id,
  topic_name,
  created_at
FROM navos_question_data
ORDER BY created_at DESC
LIMIT 10;

-- 查询topic_id的分布情况
SELECT 
  topic_id,
  COUNT(*) as count,
  MIN(topic_name) as topic_name
FROM navos_question_data
GROUP BY topic_id
ORDER BY topic_id;

-- 查询topic_list_data表的数据
SELECT 
  id,
  row_num,
  name,
  created_at
FROM topic_list_data
ORDER BY created_at DESC;