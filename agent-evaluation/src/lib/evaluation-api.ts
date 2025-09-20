import { saveEvaluationToDatabase as saveToDb, EvaluationData } from './database';

/**
 * 保存评测数据到数据库
 * @param data 评测数据
 * @returns Promise<{success: boolean, error?: string}>
 */
export async function saveEvaluationToDatabase(data: EvaluationData): Promise<{success: boolean, error?: string}> {
  try {
    console.log('📊 开始保存评测数据:', data);
    
    const result = await saveToDb(data);
    
    if (result.success) {
      console.log('✅ 评测数据保存成功');
      return { success: true };
    } else {
      console.error('❌ 评测数据保存失败:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('💥 保存评测数据时发生错误:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * 批量保存评测数据
 * @param dataList 评测数据列表
 * @returns Promise<{success: boolean, error?: string, results?: any[]}>
 */
export async function batchSaveEvaluationToDatabase(dataList: EvaluationData[]): Promise<{success: boolean, error?: string, results?: unknown[]}> {
  try {
    console.log('📊 开始批量保存评测数据，数量:', dataList.length);
    
    const results = await Promise.all(
      dataList.map(data => saveEvaluationToDatabase(data))
    );
    
    const allSuccessful = results.every(result => result.success);
    
    if (allSuccessful) {
      console.log('✅ 批量保存评测数据成功');
      return { success: true, results };
    } else {
      const failedCount = results.filter(result => !result.success).length;
      console.error(`❌ 批量保存评测数据部分失败，失败数量: ${failedCount}`);
      return { success: false, error: `${failedCount} 条数据保存失败`, results };
    }
  } catch (error) {
    console.error('💥 批量保存评测数据时发生错误:', error);
    return { success: false, error: String(error) };
  }
}