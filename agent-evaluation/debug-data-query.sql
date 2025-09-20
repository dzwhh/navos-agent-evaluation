-- 检查题集数据
SELECT 
  id,
  name,
  creator,
  status,
  question_count,
  row_num,
  created_at
FROM topic_list_data
ORDER BY created_at DESC;

-- 检查题目数据
SELECT 
  id,
  q_id,
  q_name,
  agent_scene,
  topic_name,
  topic_id,
  created_at
FROM navos_question_data
ORDER BY topic_id, q_id;

-- 检查特定题集的题目数据
SELECT 
  COUNT(*) as question_count,
  topic_id,
  topic_name
FROM navos_question_data
GROUP BY topic_id, topic_name
ORDER BY topic_id;