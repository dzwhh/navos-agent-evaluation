-- 检查agent_scene字段的数据情况
SELECT 
  id,
  q_id,
  q_name,
  agent_scene,
  topic_name,
  topic_id,
  CASE 
    WHEN agent_scene IS NULL THEN 'NULL'
    WHEN agent_scene = '' THEN 'EMPTY'
    ELSE 'HAS_DATA'
  END as scene_status
FROM navos_question_data 
ORDER BY id DESC 
LIMIT 10;

-- 统计agent_scene字段的数据分布
SELECT 
  CASE 
    WHEN agent_scene IS NULL THEN 'NULL'
    WHEN agent_scene = '' THEN 'EMPTY'
    ELSE 'HAS_DATA'
  END as scene_status,
  COUNT(*) as count
FROM navos_question_data 
GROUP BY 
  CASE 
    WHEN agent_scene IS NULL THEN 'NULL'
    WHEN agent_scene = '' THEN 'EMPTY'
    ELSE 'HAS_DATA'
  END;

-- 查看有数据的agent_scene示例
SELECT DISTINCT agent_scene
FROM navos_question_data 
WHERE agent_scene IS NOT NULL AND agent_scene != ''
LIMIT 5;