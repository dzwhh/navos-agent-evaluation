// 测试脚本：验证topicId=1的数据查询功能
const { createClient } = require('@supabase/supabase-js');

// 直接使用Supabase配置
const supabaseUrl = 'https://hhedkvyrfoonfgehnxkv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZWRrdnlyZm9vbmZnZWhueGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjAzMzQsImV4cCI6MjA3MzY5NjMzNH0.WXdyF14d2jjEVDRIuK4F4DjxJCdowk1n7AXLrU-iajA';

console.log('🔧 Supabase配置:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTopicQuery() {
  console.log('🔍 测试topicId=1的数据查询...');
  
  try {
    // 查询navos_question_data表中topic_id=1的数据
    const { data, error } = await supabase
      .from('navos_question_data')
      .select('*')
      .eq('topic_id', 1)
      .order('q_id', { ascending: true });
    
    if (error) {
      console.error('❌ 查询出错:', error);
      return;
    }
    
    console.log('✅ 查询成功!');
    console.log('📊 查询结果数量:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('📋 数据预览:');
      data.forEach((item, index) => {
        console.log(`  ${index + 1}. ID: ${item.q_id}, 名称: ${item.q_name}, 场景: ${item.agent_scene}`);
      });
    } else {
      console.log('⚠️  没有找到topic_id=1的数据');
    }
    
  } catch (err) {
    console.error('💥 测试过程中出错:', err);
  }
}

// 运行测试
testTopicQuery();