const { createClient } = require('@supabase/supabase-js');

// 直接设置环境变量
const supabaseUrl = 'https://hhedkvyrfoonfgehnxkv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZWRrdnlyZm9vbmZnZWhueGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjAzMzQsImV4cCI6MjA3MzY5NjMzNH0.WXdyF14d2jjEVDRIuK4F4DjxJCdowk1n7AXLrU-iajA';

if (!supabaseUrl || !supabaseKey) {
  console.log('Supabase环境变量未配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMappings() {
  try {
    // 检查用户题集映射
    const { data: mappings, error: mappingError } = await supabase
      .from('navos_user_topic_mapping')
      .select('*');
    
    if (mappingError) {
      console.error('查询映射记录错误:', mappingError);
      return;
    }
    
    console.log('用户题集映射记录:');
    console.log(JSON.stringify(mappings, null, 2));
    
    // 查询用户信息
    const { data: users, error: usersError } = await supabase
      .from('navos_user_info')
      .select('*');
    
    if (usersError) {
      console.error('查询用户信息失败:', usersError);
    } else {
      console.log('\n=== 用户信息 ===');
      console.log(users);
    }
    
    // 查询题目数据
    const { data: questions, error: questionsError } = await supabase
      .from('navos_question_data')
      .select('*')
      .eq('topic_id', 22);
    
    if (questionsError) {
      console.error('查询题目数据失败:', questionsError);
    } else {
      console.log('\n=== Topic ID 22 的题目数据 ===');
      console.log('题目数量:', questions.length);
      console.log(questions);
    }
    
    // 查询所有题目数据的topic_id分布
    const { data: allQuestions, error: allQuestionsError } = await supabase
      .from('navos_question_data')
      .select('topic_id')
      .order('topic_id');
    
    if (allQuestionsError) {
      console.error('查询所有题目数据失败:', allQuestionsError);
    } else {
      console.log('\n=== 所有题目的Topic ID分布 ===');
      const topicCounts = {};
      allQuestions.forEach(q => {
        topicCounts[q.topic_id] = (topicCounts[q.topic_id] || 0) + 1;
      });
      console.log(topicCounts);
    }
    
  } catch (error) {
    console.error('执行查询时发生错误:', error);
  }
}

checkMappings();