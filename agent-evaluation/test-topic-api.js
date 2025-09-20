// 简单的数据库连接测试
const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置信息');
  console.log('请确保设置了以下环境变量:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTopicListAPI() {
  console.log('开始测试题目集数据库连接...');
  
  try {
    // 1. 测试获取所有题目集
    console.log('\n1. 测试获取所有题目集:');
    const { data: allTopics, error: getAllError } = await supabase
      .from('topic_list_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (getAllError) {
      console.error('获取数据失败:', getAllError);
      return;
    }
    
    console.log('获取到的题目集数量:', allTopics.length);
    console.log('题目集列表:', allTopics.map(t => ({ id: t.id, name: t.name, creator: t.creator })));
    
    // 2. 测试创建新题目集
    console.log('\n2. 测试创建新题目集:');
    const newTopic = {
      name: '测试题目集_' + Date.now(),
      creator: '测试用户',
      status: true,
      description: '这是一个测试创建的题目集',
      question_count: 5
    };
    
    const { data: createdTopic, error: createError } = await supabase
      .from('topic_list_data')
      .insert([newTopic])
      .select()
      .single();
    
    if (createError) {
      console.error('创建失败:', createError);
      return;
    }
    
    console.log('创建成功:', createdTopic);
    
    // 3. 测试根据ID获取题目集
    console.log('\n3. 测试根据ID获取题目集:');
    const { data: topicById, error: getByIdError } = await supabase
      .from('topic_list_data')
      .select('*')
      .eq('id', createdTopic.id)
      .single();
    
    if (getByIdError) {
      console.error('根据ID获取失败:', getByIdError);
    } else {
      console.log('根据ID获取的题目集:', topicById);
    }
    
    // 4. 测试更新题目集
    console.log('\n4. 测试更新题目集:');
    const { data: updatedTopic, error: updateError } = await supabase
      .from('topic_list_data')
      .update({
        description: '更新后的描述',
        question_count: 10,
        updated_at: new Date().toISOString()
      })
      .eq('id', createdTopic.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('更新失败:', updateError);
    } else {
      console.log('更新成功:', updatedTopic);
    }
    
    // 5. 测试切换状态
    console.log('\n5. 测试切换状态:');
    const { data: toggledTopic, error: toggleError } = await supabase
      .from('topic_list_data')
      .update({
        status: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', createdTopic.id)
      .select()
      .single();
    
    if (toggleError) {
      console.error('状态切换失败:', toggleError);
    } else {
      console.log('状态切换成功:', toggledTopic);
    }
    
    // 6. 测试根据创建者获取题目集
    console.log('\n6. 测试根据创建者获取题目集:');
    const { data: topicsByCreator, error: getByCreatorError } = await supabase
      .from('topic_list_data')
      .select('*')
      .eq('creator', '测试用户');
    
    if (getByCreatorError) {
      console.error('根据创建者获取失败:', getByCreatorError);
    } else {
      console.log('该创建者的题目集数量:', topicsByCreator.length);
    }
    
    // 7. 测试根据状态获取题目集
    console.log('\n7. 测试根据状态获取题目集:');
    const { data: activeTopics } = await supabase
      .from('topic_list_data')
      .select('*')
      .eq('status', true);
    
    const { data: inactiveTopics } = await supabase
      .from('topic_list_data')
      .select('*')
      .eq('status', false);
    
    console.log('启用状态的题目集数量:', activeTopics?.length || 0);
    console.log('禁用状态的题目集数量:', inactiveTopics?.length || 0);
    
    // 8. 测试删除题目集
    console.log('\n8. 测试删除题目集:');
    const { error: deleteError } = await supabase
      .from('topic_list_data')
      .delete()
      .eq('id', createdTopic.id);
    
    if (deleteError) {
      console.error('删除失败:', deleteError);
    } else {
      console.log('删除成功');
    }
    
    // 验证删除
    const { data: deletedTopic } = await supabase
      .from('topic_list_data')
      .select('*')
      .eq('id', createdTopic.id)
      .single();
    
    console.log('删除后查询结果:', deletedTopic); // 应该为null
    
    console.log('\n✅ 所有API测试完成!');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 运行测试
testTopicListAPI();