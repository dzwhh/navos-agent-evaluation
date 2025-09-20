import { supabase } from './supabase'
import type { Database } from './supabase'

type NavosTestResult = Database['public']['Tables']['navos_test_result']['Insert']
type NavosQuestionData = Database['public']['Tables']['navos_question_data']['Insert']

export interface EvaluationData {
  qId?: number  
  qName: string
  title: string
  agentType: string
  itemVisual: number
  itemMajor: number
  itemData: number
  itemGuide: number
  agentName: string  // 模型名字
  agentScene: string  // 对应navos_question_data表中的agent_scene
  topicId: number  // 题集ID
  userName: string  // 登录用户名称
}

/**
 * 测试Supabase连接和数据库表结构
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string; details?: unknown }> {
  try {
    console.log('开始测试Supabase连接...');
    
    // 1. 测试基本连接
    const { error: connectionError } = await supabase
      .from('navos_test_result')
      .select('count', { count: 'exact', head: true })
    
    if (connectionError) {
      console.error('连接测试失败:', connectionError);
      return { success: false, error: `连接失败: ${connectionError.message}`, details: connectionError };
    }
    
    console.log('连接测试成功，表存在');
    
    // 2. 测试表结构
    const { error: structureError } = await supabase
      .from('navos_test_result')
      .select('*')
      .limit(1)
    
    if (structureError) {
      console.error('表结构测试失败:', structureError);
      return { success: false, error: `表结构错误: ${structureError.message}`, details: structureError };
    }
    
    console.log('表结构测试成功');
    
    // 3. 测试插入权限
    const testData = {
      q_id: 999,
      q_name: 'TEST_CONNECTION',
      title: 'Test Title',
      agent_type: 'Test Agent',
      item_visual: 1,
      item_major: 1,
      item_data: 1,
      item_guide: 1,
      agent_name: 'Test Model',
      agent_scene: 'Test Scene',
      topic_id: 1,
      user_name: 'Test User',
      created_at: new Date().toISOString()
    };
    
    const { data: insertTest, error: insertError } = await supabase
      .from('navos_test_result')
      .insert(testData as any)
      .select()
    
    if (insertError) {
      console.error('插入权限测试失败:', insertError);
      return { success: false, error: `插入权限错误: ${insertError.message}`, details: insertError };
    }
    
    console.log('插入权限测试成功:', insertTest);
    
    // 4. 清理测试数据
    if (insertTest && insertTest.length > 0) {
      await supabase
        .from('navos_test_result')
        .delete()
        .eq('q_id', 999)
        .eq('q_name', 'TEST_CONNECTION');
      console.log('测试数据已清理');
    }
    
    return { success: true, details: { connection: true, structure: true, permissions: true } };
  } catch (error) {
    console.error('测试过程中发生意外错误:', error);
    return { success: false, error: `意外错误: ${error}`, details: error };
  }
}

/**
 * 将评测数据写入到 navos_test_result 表
 * 使用 upsert 操作基于联合主键 (q_id, title, user_name) 进行插入或更新
 */
export async function saveEvaluationToDatabase(data: EvaluationData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🚀 [DATABASE] 开始保存评测数据到数据库:', data);
    
    // 数据验证
    if (!data.qId || !data.title || !data.userName) {
      const missingFields = [];
      if (!data.qId) missingFields.push('qId');
      if (!data.title) missingFields.push('title');
      if (!data.userName) missingFields.push('userName');
      const errorMsg = `缺少必要字段: ${missingFields.join(', ')}`;
      console.error('❌ [DATABASE] 数据验证失败:', errorMsg, data);
      return { success: false, error: errorMsg };
    }
    
    // 使用题集数据中的题目ID作为q_id
    const assignedQId = data.qId || 1; // 如果没有提供qId，则默认为1

    const insertData: NavosTestResult = {
      q_id: assignedQId,
      q_name: data.qName || '',
      title: data.title,
      agent_type: data.agentType || '',  // 修复字段名拼写错误
      item_visual: data.itemVisual || 0,
      item_major: data.itemMajor || 0,
      item_data: data.itemData || 0,
      item_guide: data.itemGuide || 0,
      agent_name: data.agentName || '',  // 模型名字
      agent_scene: data.agentScene || '',  // 对应navos_question_data表中的agent_scene
      topic_id: data.topicId || null,  // 题集ID
      user_name: data.userName,  // 登录用户名称
      created_at: new Date().toISOString()
    }

    console.log('📝 准备 upsert 的数据:', {
      ...insertData,
      联合主键: `${insertData.q_id}-${insertData.title}-${insertData.user_name}`
    });

    // 使用 upsert 操作，基于联合主键 (q_id, title, user_name) 进行插入或更新
    console.log('🔄 [DATABASE] 执行upsert操作，联合主键:', { q_id: insertData.q_id, title: insertData.title, user_name: insertData.user_name });
    
    const { data: result, error } = await supabase
      .from('navos_test_result')
      .upsert(insertData as any, {
        onConflict: 'q_id,title,user_name',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('❌ [DATABASE] 数据库保存失败:', {
        联合主键: `q_id=${insertData.q_id}, title=${insertData.title}, user_name=${insertData.user_name}`,
        错误信息: error.message,
        错误详情: error.details,
        错误提示: error.hint,
        错误代码: error.code,
        堆栈跟踪: error.stack,
        完整错误对象: JSON.stringify(error, null, 2)
      });
      
      // 检查是否是权限问题
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        console.error('🔒 权限错误: 可能需要检查RLS策略或角色权限');
      }
      
      // 检查是否是约束违反
      if (error.code === '23505') {
        console.error('🔑 唯一约束违反: 可能存在重复的联合主键');
      }
      
      return { 
        success: false, 
        error: `数据库保存失败: ${error.message} (代码: ${error.code})` 
      };
    }

    console.log('✅ [DATABASE] 数据库保存成功:', result)
    return { success: true }
  } catch (error) {
    console.error('❌ Unexpected error saving to database:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return { success: false, error: `意外错误: ${error instanceof Error ? error.message : String(error)}` }
  }
}

/**
 * 获取用户的评测历史记录
 */
export async function getUserEvaluationHistory() {
  try {
    const { data, error } = await supabase
      .from('navos_test_result')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取评测历史失败:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log('获取评测历史成功:', data);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('获取评测历史时发生错误:', error);
    return { success: false, error: String(error), data: [] };
  }
}

/**
 * 批量保存题目数据到 navos_question_data 表
 */
export async function saveQuestionsToDatabase(questions: unknown[], topicName?: string, topicId?: number): Promise<{ success: boolean; error?: string; data?: unknown[] }> {
  try {
    console.log('开始保存题目数据到数据库:', questions, '题集名称:', topicName, '题集序号:', topicId);
    
    // 转换题目数据格式以匹配数据库表结构
    const questionData: NavosQuestionData[] = questions.map(question => ({
      q_id: parseInt((question as any).id) || 0,
      q_name: (question as any).name || '',
      agent_scene: (question as any).scenario || '',
      minimax: (question as any).minimaxResult || '',
      qwen: (question as any).qwenResult || '',
      deepseek: (question as any).deepseekResult || '',
      chatgpt: (question as any).chatgptResult || '',
      manus: (question as any).manusResult || '',
      navos: (question as any).navosResult || '',
      topic_name: topicName || '',
      topic_id: topicId || null
    }));
    
    console.log('准备插入的数据样本:', questionData.slice(0, 2)); // 只显示前2条数据
    
    // 批量插入数据
    const { data, error } = await supabase
      .from('navos_question_data')
      .insert(questionData as any)
      .select();
    
    if (error) {
      console.error('保存题目数据失败:', error);
      console.error('错误详情:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('失败的数据样本:', questionData.slice(0, 2));
      return { success: false, error: `数据库错误: ${error.message}` };
    }
    
    console.log('保存题目数据成功:', data);
    return { success: true, data };
  } catch (error) {
    console.error('保存题目数据时发生错误:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * 从数据库获取题目数据
 */
export async function getQuestionsFromDatabase(): Promise<{ success: boolean; error?: string; data?: unknown[] }> {
  try {
    console.log('开始从数据库获取题目数据...');
    
    const { data, error } = await supabase
      .from('navos_question_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取题目数据失败:', error);
      return { success: false, error: error.message, data: [] };
    }
    
    // 转换数据格式以匹配前端期望的格式
    const questions = data?.map(item => ({
      id: (item as any).q_id,
      name: (item as any).q_name,
      scenario: (item as any).agent_scene,
      minimaxResult: (item as any).minimax,
      qwenResult: (item as any).qwen,
      deepseekResult: (item as any).deepseek,
      chatgptResult: (item as any).chatgpt,
      manusResult: (item as any).manus,
      navosResult: (item as any).navos,
      topicName: (item as any).topic_name,
      created_at: (item as any).created_at
    })) || [];
    
    console.log('获取题目数据成功:', questions);
    return { success: true, data: questions };
  } catch (error) {
    console.error('获取题目数据时发生错误:', error);
    return { success: false, error: String(error), data: [] };
  }
}

/**
 * 根据题集序号获取题目数据
 */
export async function getQuestionsBySetId(setId: number): Promise<{ success: boolean; error?: string; data?: unknown[] }> {
  try {
    console.log('🔍 开始获取题集数据，题集序号:', setId);
    console.log('🔍 查询参数类型:', typeof setId, '值:', setId);
    
    const { data, error } = await supabase
      .from('navos_question_data')
      .select('*')
      .eq('topic_id', setId)
      .order('q_id', { ascending: true });
    
    console.log('🔍 数据库查询结果:', { data: data?.length || 0, error });
    
    if (error) {
      console.error('❌ 获取题集数据失败:', error);
      return { success: false, error: error.message, data: [] };
    }
    
    if (!data || data.length === 0) {
      console.warn('⚠️ 没有找到匹配的数据，topic_id:', setId);
      return { success: true, data: [] };
    }
    
    // 转换数据格式
    const questions = data?.map(item => ({
      id: (item as any).q_id,
      name: (item as any).q_name,
      scenario: (item as any).agent_scene,
      minimaxResult: (item as any).minimax,
      qwenResult: (item as any).qwen,
      deepseekResult: (item as any).deepseek,
      chatgptResult: (item as any).chatgpt,
      manusResult: (item as any).manus,
      navosResult: (item as any).navos,
      topicName: (item as any).topic_name
    })) || [];
    
    console.log('✅ 获取题集数据成功，数量:', questions.length);
    console.log('✅ 前3条数据预览:', questions.slice(0, 3).map(q => ({ id: q.id, name: q.name })));
    return { success: true, data: questions };
  } catch (error) {
    console.error('💥  获取题集数据时发生错误:', error);
    return { success: false, error: String(error), data: [] };
  }
}

/**
 * 根据用户名、题集ID查询用户的评分数据
 */
export async function getUserEvaluationsByTopicId(userName: string, topicId: number): Promise<{ success: boolean; error?: string; data?: unknown[] }> {
  try {
    console.log('🔍 开始获取用户评分数据，用户:', userName, '题集ID:', topicId);
    
    const { data, error } = await supabase
      .from('navos_test_result')
      .select('*')
      .eq('user_name', userName)
      .eq('topic_id', topicId)
      .order('q_id', { ascending: true });
    
    if (error) {
      console.error('❌ 获取用户评分数据失败:', error);
      return { success: false, error: error.message, data: [] };
    }
    
    console.log('✅ 获取用户评分数据成功，数量:', data?.length || 0);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('💥 获取用户评分数据时发生错误:', error);
    return { success: false, error: String(error), data: [] };
  }
}

/**
 * 根据用户名、题集ID、题目ID查询特定题目的评分数据
 */
export async function getUserEvaluationByQuestionId(userName: string, topicId: number, questionId: number): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    console.log('🔍 开始获取特定题目评分数据，用户:', userName, '题集ID:', topicId, '题目ID:', questionId);
    
    const { data, error } = await supabase
      .from('navos_test_result')
      .select('*')
      .eq('user_name', userName)
      .eq('topic_id', topicId)
      .eq('q_id', questionId)
      .single();
    
    if (error) {
      // 如果没有找到数据，这是正常情况，不是错误
      if (error.code === 'PGRST116') {
        console.log('📝 该题目尚未评分');
        return { success: true, data: null };
      }
      console.error('❌ 获取特定题目评分数据失败:', error);
      return { success: false, error: error.message, data: null };
    }
    
    console.log('✅ 获取特定题目评分数据成功:', data);
    return { success: true, data };
  } catch (error) {
    console.error('💥 获取特定题目评分数据时发生错误:', error);
    return { success: false, error: String(error), data: null };
  }
}

/**
 * 根据q_id查询navos_question_data表获取agent_scene
 */
export async function getAgentSceneByQuestionId(qId: number): Promise<{ success: boolean; error?: string; agentScene?: string }> {
  try {
    console.log('🔍 开始根据q_id获取agent_scene，题目ID:', qId);
    
    const { data, error } = await supabase
      .from('navos_question_data')
      .select('agent_scene')
      .eq('q_id', qId)
      .limit(1)
      .single();
    
    if (error) {
      // 如果没有找到数据
      if (error.code === 'PGRST116') {
        console.log('📝 未找到对应的题目数据');
        return { success: true, agentScene: '' };
      }
      console.error('❌ 获取agent_scene失败:', error);
      return { success: false, error: error.message, agentScene: '' };
    }
    
    const agentScene = (data as any)?.agent_scene || '';
    console.log('✅ 获取agent_scene成功:', agentScene);
    return { success: true, agentScene };
  } catch (error) {
    console.error('💥 获取agent_scene时发生错误:', error);
    return { success: false, error: String(error), agentScene: '' };
  }
}