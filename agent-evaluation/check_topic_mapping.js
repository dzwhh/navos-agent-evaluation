const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://hhedkvyrfoonfgehnxkv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZWRrdnlyZm9vbmZnZWhueGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjAzMzQsImV4cCI6MjA3MzY5NjMzNH0.WXdyF14d2jjEVDRIuK4F4DjxJCdowk1n7AXLrU-iajA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTopicMapping() {
  try {
    console.log('🔍 查询navos_user_topic_mapping表数据...');
    
    // 查询所有用户映射数据
    const { data: mappings, error } = await supabase
      .from('navos_user_topic_mapping')
      .select('*')
      .order('user_id');
    
    if (error) {
      console.error('❌ 查询失败:', error);
      return;
    }
    
    console.log('\n📊 用户题集映射数据:');
    console.log('总记录数:', mappings.length);
    
    if (mappings.length > 0) {
      console.log('\n详细数据:');
      mappings.forEach(mapping => {
        console.log(`用户ID: ${mapping.user_id}, 用户名: ${mapping.user_name}, 题集ID: ${mapping.topic_id}, 题集名: ${mapping.topic_name}`);
      });
      
      // 统计topic_id分布
      const topicIdCounts = {};
      mappings.forEach(mapping => {
        const topicId = mapping.topic_id;
        topicIdCounts[topicId] = (topicIdCounts[topicId] || 0) + 1;
      });
      
      console.log('\n📈 Topic ID 分布统计:');
      Object.entries(topicIdCounts).forEach(([topicId, count]) => {
        console.log(`Topic ID ${topicId}: ${count} 个用户`);
      });
      
      // 检查是否所有用户都映射到同一个topic_id
      const uniqueTopicIds = Object.keys(topicIdCounts);
      if (uniqueTopicIds.length === 1) {
        console.log(`\n✅ 所有用户都映射到同一个 Topic ID: ${uniqueTopicIds[0]}`);
      } else {
        console.log(`\n⚠️ 用户映射到不同的 Topic ID: ${uniqueTopicIds.join(', ')}`);
      }
    } else {
      console.log('❌ 没有找到任何映射数据');
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  }
}

checkTopicMapping();