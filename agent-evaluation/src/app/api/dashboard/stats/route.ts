import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // 验证用户session cookie
    const userSession = request.cookies.get('user-session');
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let userData;
    try {
      userData = JSON.parse(userSession.value);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    // 检查是否为管理员
    if (userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 获取用户数
    const { data: users, error: usersError } = await supabase
      .from('navos_user_info')
      .select('id', { count: 'exact' });
    
    if (usersError) {
      console.error('获取用户数失败:', usersError);
    }

    // 获取题目数量
    const { data: questions, error: questionsError } = await supabase
      .from('navos_question_data')
      .select('id', { count: 'exact' });
    
    if (questionsError) {
      console.error('获取题目数失败:', questionsError);
    }

    // 获取答题人数（去重）
    const { data: answeredUsers, error: answeredUsersError } = await supabase
      .from('navos_test_result')
      .select('user_name', { count: 'exact' })
      .not('user_name', 'is', null);
    
    if (answeredUsersError) {
      console.error('获取答题人数失败:', answeredUsersError);
    }

    // 获取已答题次数
    const { count: totalAnswersCount, error: totalAnswersError } = await supabase
      .from('navos_test_result')
      .select('*', { count: 'exact', head: true });
    
    if (totalAnswersError) {
      console.error('获取答题次数失败:', totalAnswersError);
    }

    // 获取去重的答题人数
    const { data: uniqueAnsweredUsers, error: uniqueError } = await supabase
      .from('navos_test_result')
      .select('user_name')
      .not('user_name', 'is', null);
    
    const uniqueUserCount = uniqueAnsweredUsers ? 
      new Set(uniqueAnsweredUsers.map(u => u.user_name)).size : 0;

    const stats = {
      userCount: users?.length || 0,
      questionCount: questions?.length || 0,
      answeredUserCount: uniqueUserCount,
      totalAnswers: totalAnswersCount || 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}