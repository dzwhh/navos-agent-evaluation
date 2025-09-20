import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const setId = searchParams.get('setId');

    if (!setId) {
      return NextResponse.json(
        { success: false, error: 'setId parameter is required' },
        { status: 400 }
      );
    }

    // 查询指定题集的所有题目
    const { data: questions, error } = await supabase
      .from('navos_question_data')
      .select('*')
      .eq('topic_id', parseInt(setId))
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch questions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: questions || []
    });
  } catch (error) {
    console.error('Error in questions API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}