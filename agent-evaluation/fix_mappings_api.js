// 通过API更新用户映射记录
async function fixMappingsViaAPI() {
  try {
    console.log('🔧 开始通过API修复用户映射记录...');
    
    // 首先获取所有映射记录
    const response = await fetch('http://localhost:3000/api/user-topic-mappings');
    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ 获取映射记录失败:', result.error);
      return;
    }
    
    const mappings = result.data;
    console.log('📋 当前映射记录:', mappings);
    
    // 找到需要更新的记录（topic_id为22的）
    const recordsToUpdate = mappings.filter(mapping => mapping.topic_id === 22);
    console.log('🎯 需要更新的记录数量:', recordsToUpdate.length);
    
    // 更新每个记录
    for (const record of recordsToUpdate) {
      console.log(`🔄 更新用户 ${record.user_name} (ID: ${record.user_id}) 的映射记录...`);
      
      const updateResponse = await fetch('http://localhost:3000/api/user-topic-mappings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: record.user_id,
          topicId: 24,
          topicName: 'navos 第一轮题集'
        })
      });
      
      const updateResult = await updateResponse.json();
      
      if (updateResult.success) {
        console.log(`✅ 用户 ${record.user_name} 更新成功`);
      } else {
        console.error(`❌ 用户 ${record.user_name} 更新失败:`, updateResult.error);
      }
    }
    
    // 验证更新结果
    console.log('\n🔍 验证更新结果...');
    const verifyResponse = await fetch('http://localhost:3000/api/user-topic-mappings');
    const verifyResult = await verifyResponse.json();
    
    if (verifyResult.success) {
      console.log('✅ 更新后的映射记录:');
      console.log(verifyResult.data);
    } else {
      console.error('❌ 验证失败:', verifyResult.error);
    }
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  }
}

fixMappingsViaAPI();