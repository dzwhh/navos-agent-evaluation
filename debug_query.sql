-- 查询navos_question_data表中的数据
SELECT 
  id,
  q_id,
  q_name,
  agent_scene,
  minimax,
  qwen,
  deepseek,
  chatgpt,
  manus,
  navos,
  topic_name,
  topic_id
FROM navos_question_data
LIMIT 5;

-- 查询数据总数
SELECT COUNT(*) as total_count FROM navos_question_data;

-- 查询不同topic_id的数据分布
SELECT topic_id, topic_name, COUNT(*) as question_count 
FROM navos_question_data 
GROUP BY topic_id, topic_name;