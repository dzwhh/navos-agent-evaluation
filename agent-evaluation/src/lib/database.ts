import { supabase } from './supabase'
import type { Database } from './supabase'

type NavosTestResult = Database['public']['Tables']['navos_test_result']['Insert']

export interface EvaluationData {
  qId?: number  // 可选，如果不提供则自动分配
  qName: string
  title: string
  agentType: string
  itemVisual: number
  itemMajor: number
  itemData: number
  itemGuide: number
  questionIndex?: number  // 题目索引，用于自动分配q_id
}

/**
 * 测试Supabase连接和数据库表结构
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    console.log('开始测试Supabase连接...');
    
    // 1. 测试基本连接
    const { data: connectionTest, error: connectionError } = await supabase
      .from('navos_test_result')
      .select('count', { count: 'exact', head: true })
    
    if (connectionError) {
      console.error('连接测试失败:', connectionError);
      return { success: false, error: `连接失败: ${connectionError.message}`, details: connectionError };
    }
    
    console.log('连接测试成功，表存在');
    
    // 2. 测试表结构
    const { data: structureTest, error: structureError } = await supabase
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
      created_at: new Date().toISOString()
    };
    
    const { data: insertTest, error: insertError } = await supabase
      .from('navos_test_result')
      .insert(testData)
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
 * 自动为20道题目分配q_id序号1-20
 */
export async function saveEvaluationToDatabase(data: EvaluationData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('开始保存评测数据到数据库:', data);
    
    // 自动分配q_id：如果没有提供qId，则根据questionIndex分配1-20的序号
    let assignedQId = data.qId;
    if (!assignedQId && data.questionIndex !== undefined) {
      // questionIndex从0开始，所以+1得到1-20的序号
      assignedQId = data.questionIndex + 1;
    }
    // 如果仍然没有qId，则默认为1
    if (!assignedQId) {
      assignedQId = 1;
    }
    // 确保q_id在1-20范围内
    assignedQId = Math.max(1, Math.min(20, assignedQId));

    const insertData: NavosTestResult = {
      q_id: assignedQId,
      q_name: data.qName,
      title: data.title,
      agent_type: data.agentType,  // 修复字段名拼写错误
      item_visual: data.itemVisual,
      item_major: data.itemMajor,
      item_data: data.itemData,
      item_guide: data.itemGuide,
      created_at: new Date().toISOString()
    }

    console.log('准备插入的数据:', insertData);

    const { data: result, error } = await supabase
      .from('navos_test_result')
      .insert(insertData)
      .select()

    if (error) {
      console.error('Database insert error:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message }
    }

    console.log('Evaluation data saved to database:', result)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error saving to database:', error)
    return { success: false, error: 'Unexpected error occurred' }
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
      console.error('Database query error:', error)
      return { success: false, error: error.message, data: null }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error querying database:', error)
    return { success: false, error: 'Unexpected error occurred', data: null }
  }
}