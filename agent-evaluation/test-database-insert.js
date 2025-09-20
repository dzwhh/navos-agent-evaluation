// 测试数据库插入功能
const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 缺少Supabase配置信息');
  console.log('请确保设置了以下环境变量:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseInsert() {
  console.log('🔍 开始测试数据库插入功能...');
  
  try {
    // 测试数据 - 模拟第1题的评测结果
    const testData1 = {
      q_id: 1,
      q_name: '测试题目1',
      title: '测试答案1',
      agent_type: 'ChatGPT',
      item_visual: 5,
      item_major: 4,
      item_data: 3,
      item_guide: 4,
      agent_name: 'gpt-4',
      agent_scene: '对话场景',
      topic_id: 1,
      user_name: 'admin'
    };
    
    console.log('📝 插入第1题测试数据:', testData1);
    const { data: result1, error: error1 } = await supabase
      .from('navos_test_result')
      .insert(testData1)
      .select();
    
    if (error1) {
      console.error('❌ 第1题插入失败:', error1);
      return;
    }
    
    console.log('✅ 第1题插入成功:', result1);
    
    // 测试数据 - 模拟第2题的评测结果
    const testData2 = {
      q_id: 2,
      q_name: '测试题目2',
      title: '测试答案2',
      agent_type: 'Claude',
      item_visual: 4,
      item_major: 5,
      item_data: 4,
      item_guide: 3,
      agent_name: 'claude-3',
      agent_scene: '推理场景',
      topic_id: 1,
      user_name: 'admin'
    };
    
    console.log('📝 插入第2题测试数据:', testData2);
    const { data: result2, error: error2 } = await supabase
      .from('navos_test_result')
      .insert(testData2)
      .select();
    
    if (error2) {
      console.error('❌ 第2题插入失败:', error2);
      return;
    }
    
    console.log('✅ 第2题插入成功:', result2);
    
    // 查询所有数据验证
    console.log('🔍 查询所有测试数据...');
    const { data: allData, error: queryError } = await supabase
      .from('navos_test_result')
      .select('*')
      .eq('user_name', 'admin')
      .eq('topic_id', 1)
      .order('q_id', { ascending: true });
    
    if (queryError) {
      console.error('❌ 查询失败:', queryError);
      return;
    }
    
    console.log('✅ 查询成功，共找到', allData.length, '条记录:');
    allData.forEach((record, index) => {
      console.log(`  ${index + 1}. 题目${record.q_id}: ${record.q_name} - ${record.agent_type}`);
    });
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testDatabaseInsert();