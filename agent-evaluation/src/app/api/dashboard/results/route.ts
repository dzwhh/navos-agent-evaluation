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

    // 获取URL参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // 获取navos_test_result表的明细数据
    const { data: testResults, error: resultsError } = await supabase
      .from('navos_test_result')
      .select(`
        user_name,
        created_at,
        q_id,
        q_name,
        agent_type,
        agent_name,
        agent_scene,
        item_visual,
        item_major,
        item_data,
        item_guide
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (resultsError) {
      console.error('获取测试结果失败:', resultsError);
      return NextResponse.json(
        { error: '获取测试结果失败' },
        { status: 500 }
      );
    }

    // 获取总数用于分页
    const { count, error: countError } = await supabase
      .from('navos_test_result')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('获取总数失败:', countError);
    }

    const response = {
      data: testResults || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    return NextResponse.json(testResults || []);
  } catch (error) {
    console.error('Dashboard results API error:', error);
    return NextResponse.json(
      { error: '获取明细数据失败' },
      { status: 500 }
    );
  }
}