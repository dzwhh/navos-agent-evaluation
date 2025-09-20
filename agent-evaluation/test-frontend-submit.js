// 测试前端submitEvaluation函数的数据写入逻辑
const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://ixqhqjqhqjqhqjqhqjqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWhxanFocWpxaHFqcWhxanFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MzI2NzQsImV4cCI6MjA1MDAwODY3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

// 模拟前端的saveEvaluationToDatabase函数
async function saveEvaluationToDatabase(data) {
  try {
    console.log('开始保存评测数据到数据库:', data);
    
    // 使用题集数据中的题目ID作为q_id
    const assignedQId = data.qId || 1;

    const insertData = {
      q_id: assignedQId,
      q_name: data.qName || '',
      title: data.title || '',
      agent_type: data.agentType || '',
      item_visual: data.itemVisual || 0,
      item_major: data.itemMajor || 0,
      item_data: data.itemData || 0,
      item_guide: data.itemGuide || 0,
      agent_name: data.agentName || '',
      agent_scene: data.agentScene || '',
      topic_id: data.topicId || null,
      user_name: data.userName || ''
    };

    console.log('准备插入的数据:', insertData);

    const { data: result, error } = await supabase
      .from('navos_test_result')
      .insert([insertData])
      .select();

    if (error) {
      console.error('数据库插入错误:', error);
      return { success: false, error: error.message };
    }

    console.log('评测数据保存成功:', result);
    return { success: true };
  } catch (error) {
    console.error('保存到数据库时发生意外错误:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

// 模拟前端的题目数据和评分数据
const mockQuestions = [
  {
    id: 'q1',
    title: '第1题：数据分析场景',
    scenario: '数据分析',
    answers: [
      { id: 'a1', title: 'GPT-4', description: 'OpenAI GPT-4模型' },
      { id: 'a2', title: 'Claude', description: 'Anthropic Claude模型' }
    ]
  },
  {
    id: 'q2', 
    title: '第2题：代码生成场景',
    scenario: '代码生成',
    answers: [
      { id: 'a3', title: 'Copilot', description: 'GitHub Copilot' },
      { id: 'a4', title: 'CodeT5', description: 'Salesforce CodeT5' }
    ]
  }
];

const mockQuestionRatings = [
  {
    questionId: 'q1',
    answerRatings: [
      {
        answerId: 'a1',
        scores: [
          { dimension: 'intuitive', value: 4 },
          { dimension: 'professional', value: 5 },
          { dimension: 'data_sufficiency', value: 3 },
          { dimension: 'guidance', value: 4 }
        ]
      },
      {
        answerId: 'a2',
        scores: [
          { dimension: 'intuitive', value: 3 },
          { dimension: 'professional', value: 4 },
          { dimension: 'data_sufficiency', value: 4 },
          { dimension: 'guidance', value: 3 }
        ]
      }
    ]
  },
  {
    questionId: 'q2',
    answerRatings: [
      {
        answerId: 'a3',
        scores: [
          { dimension: 'intuitive', value: 5 },
          { dimension: 'professional', value: 4 },
          { dimension: 'data_sufficiency', value: 4 },
          { dimension: 'guidance', value: 5 }
        ]
      },
      {
        answerId: 'a4',
        scores: [
          { dimension: 'intuitive', value: 3 },
          { dimension: 'professional', value: 3 },
          { dimension: 'data_sufficiency', value: 2 },
          { dimension: 'guidance', value: 3 }
        ]
      }
    ]
  }
];

// 模拟前端的submitEvaluation逻辑
async function testSubmitEvaluation() {
  console.log('🧪 开始测试前端submitEvaluation逻辑...');
  
  const mockUser = { username: 'test_user' };
  const mockTopicId = 1;
  
  try {
    // 准备数据库写入数据
    const evaluationPromises = mockQuestionRatings.map(async (questionRating) => {
      const question = mockQuestions.find(q => q.id === questionRating.questionId);
      if (!question) {
        console.log(`❌ 未找到题目: ${questionRating.questionId}`);
        return;
      }
      
      console.log(`📝 处理题目: ${question.title}`);
      
      // 为每个答案的评分创建数据库记录
      const answerPromises = questionRating.answerRatings.map(async (answerRating) => {
        const answer = question.answers.find(a => a.id === answerRating.answerId);
        if (!answer || answerRating.scores.length === 0) {
          console.log(`❌ 未找到答案或评分为空: ${answerRating.answerId}`);
          return;
        }
        
        console.log(`  📊 处理答案: ${answer.title}`);
        
        // 将评分转换为数据库格式
        const scores = {
          item_visual: answerRating.scores.find(s => s.dimension === 'intuitive')?.value || 0,
          item_major: answerRating.scores.find(s => s.dimension === 'professional')?.value || 0,
          item_data: answerRating.scores.find(s => s.dimension === 'data_sufficiency')?.value || 0,
          item_guide: answerRating.scores.find(s => s.dimension === 'guidance')?.value || 0
        };
        
        const evaluationData = {
          qName: question.title,
          title: answer.title,
          agentType: answer.description || '',
          itemVisual: scores.item_visual,
          itemMajor: scores.item_major,
          itemData: scores.item_data,
          itemGuide: scores.item_guide,
          qId: question.id,  // 使用题目的实际ID作为q_id
          agentName: answer.title || answer.description || '',
          agentScene: question.scenario || '',
          topicId: mockTopicId,
          userName: mockUser.username
        };
        
        console.log(`    💾 保存评测数据:`, evaluationData);
        return saveEvaluationToDatabase(evaluationData);
      });
      
      return Promise.all(answerPromises);
    });
    
    // 等待所有数据库写入完成
    const results = await Promise.all(evaluationPromises);
    const allSuccessful = results.every(resultGroup => 
      resultGroup?.every(result => result?.success)
    );
    
    if (allSuccessful) {
      console.log('✅ 所有评测数据保存成功！');
    } else {
      console.log('⚠️ 部分数据保存失败');
      console.log('结果详情:', results);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testSubmitEvaluation();