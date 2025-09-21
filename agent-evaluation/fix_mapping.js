const { createClient } = require('@supabase/supabase-js');

// 直接设置 Supabase 配置
const supabaseUrl = 'https://ixqhqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWhxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY3NTU5NzQsImV4cCI6MjA0MjMzMTk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserMappings() {
  try {
    console.log('🔧 开始修复用户映射记录...');
    
    // 更新所有用户的topic_id从22改为24
    const { data, error } = await supabase
      .from('navos_user_topic_mapping')
      .update({ topic_id: 24, topic_name: 'navos 第一轮题集' })
      .eq('topic_id', 22);
    
    if (error) {
      console.error('❌ 更新映射记录失败:', error);
      return;
    }
    
    console.log('✅ 映射记录更新成功');
    
    // 验证更新结果
    const { data: updatedMappings, error: verifyError } = await supabase
      .from('navos_user_topic_mapping')
      .select('*');
    
    if (verifyError) {
      console.error('❌ 验证更新结果失败:', verifyError);
      return;
    }
    
    console.log('\n=== 更新后的映射记录 ===');
    console.log(updatedMappings);
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  }
}

fixUserMappings();