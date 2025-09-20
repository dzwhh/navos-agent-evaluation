-- 修复agent_scene字段为空的问题
-- 为空的agent_scene字段填充默认场景值

UPDATE navos_question_data 
SET agent_scene = CASE 
  WHEN q_name LIKE '%对话%' OR q_name LIKE '%聊天%' THEN '对话场景'
  WHEN q_name LIKE '%编程%' OR q_name LIKE '%代码%' OR q_name LIKE '%算法%' THEN '编程场景'
  WHEN q_name LIKE '%推理%' OR q_name LIKE '%逻辑%' THEN '逻辑推理场景'
  WHEN q_name LIKE '%知识%' OR q_name LIKE '%问答%' THEN '知识问答场景'
  WHEN q_name LIKE '%图像%' OR q_name LIKE '%视觉%' THEN '图像理解场景'
  WHEN q_name LIKE '%客服%' OR q_name LIKE '%服务%' THEN '客服场景'
  WHEN q_name LIKE '%销售%' OR q_name LIKE '%营销%' THEN '销售场景'
  WHEN q_name LIKE '%技术%' OR q_name LIKE '%支持%' THEN '技术支持场景'
  ELSE '通用场景'
END
WHERE agent_scene IS NULL OR agent_scene = '';

-- 查看更新结果
SELECT 
  id,
  q_id,
  q_name,
  agent_scene,
  CASE 
    WHEN agent_scene IS NULL THEN 'NULL'
    WHEN agent_scene = '' THEN 'EMPTY'
    ELSE 'HAS_DATA'
  END as scene_status
FROM navos_question_data 
ORDER BY id DESC 
LIMIT 10;