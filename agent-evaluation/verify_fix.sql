-- 验证agent_scene字段修复结果

-- 1. 检查所有数据的agent_scene状态
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

-- 2. 查看修复后的数据样本
SELECT 
  id,
  q_id,
  q_name,
  agent_scene,
  topic_name
FROM navos_question_data 
WHERE agent_scene IS NOT NULL AND agent_scene != ''
ORDER BY id DESC 
LIMIT 10;

-- 3. 检查是否还有空的agent_scene
SELECT COUNT(*) as empty_count
FROM navos_question_data 
WHERE agent_scene IS NULL OR agent_scene = '';