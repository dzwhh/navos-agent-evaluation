-- 测试查询navos_question_data表中topic_id=1的数据
SELECT 
  id,
  q_id,
  q_name,
  topic_id,
  topic_name,
  agent_scene,
  created_at
FROM navos_question_data 
WHERE topic_id = 1
ORDER BY q_id ASC;

-- 查看所有topic_id的分布情况
SELECT 
  topic_id,
  COUNT(*) as question_count,
  MIN(topic_name) as topic_name
FROM navos_question_data 
GROUP BY topic_id 
ORDER BY topic_id;

-- 查看最近的数据
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