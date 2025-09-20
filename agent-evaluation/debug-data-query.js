const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 手动读取.env.local文件
let supabaseUrl, supabaseKey;
try {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  });
} catch (error) {
  console.error('❌ 读取环境变量文件失败:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase配置缺失');
  console.log('SUPABASE_URL:', supabaseUrl ? '已配置' : '未配置');
  console.log('SUPABASE_ANON_KEY:', supabaseKey ? '已配置' : '未配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDataQuery() {
  console.log('🔍 开始调试数据查询...');
  
  try {
    // 1. 查询topic_list_data表
    console.log('\n1. 查询topic_list_data表:');
    const { data: topicData, error: topicError } = await supabase
      .from('topic_list_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (topicError) {
      console.error('❌ 查询topic_list_data失败:', topicError);
    } else {
      console.log('✅ topic_list_data数据:', topicData);
      console.log('📊 题集数量:', topicData?.length || 0);
    }
    
    // 2. 查询navos_question_data表的所有数据
    console.log('\n2. 查询navos_question_data表:');
    const { data: questionData, error: questionError } = await supabase
      .from('navos_question_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (questionError) {
      console.error('❌ 查询navos_question_data失败:', questionError);
    } else {
      console.log('✅ navos_question_data数据样本:', questionData);
      console.log('📊 题目数量:', questionData?.length || 0);
      
      if (questionData && questionData.length > 0) {
        console.log('\n📋 topic_id分布:');
        const topicIdCounts = {};
        questionData.forEach(item => {
          const topicId = item.topic_id;
          topicIdCounts[topicId] = (topicIdCounts[topicId] || 0) + 1;
        });
        console.log(topicIdCounts);
      }
    }
    
    // 3. 测试特定topic_id的查询
    if (topicData && topicData.length > 0) {
      const firstTopic = topicData[0];
      console.log('\n3. 测试特定topic_id查询:');
      console.log('🎯 使用题集:', { id: firstTopic.id, row_num: firstTopic.row_num, name: firstTopic.name });
      
      const { data: filteredData, error: filterError } = await supabase
        .from('navos_question_data')
        .select('*')
        .eq('topic_id', firstTopic.row_num)
        .order('q_id', { ascending: true });
      
      if (filterError) {
        console.error('❌ 按topic_id查询失败:', filterError);
      } else {
        console.log('✅ 按topic_id查询结果:', filteredData);
        console.log('📊 匹配的题目数量:', filteredData?.length || 0);
        
        if (filteredData && filteredData.length > 0) {
          console.log('📋 前3条数据预览:');
          filteredData.slice(0, 3).forEach((item, index) => {
            console.log(`  ${index + 1}. ID:${item.q_id}, 名称:${item.q_name}, topic_id:${item.topic_id}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('💥 调试过程中发生错误:', error);
  }
}

// 运行调试
debugDataQuery();