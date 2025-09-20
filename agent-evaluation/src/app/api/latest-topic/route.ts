import { NextRequest, NextResponse } from 'next/server'
import { topicListAPI } from '@/lib/supabase'
import { getQuestionsBySetId } from '@/lib/database'

// GET - 获取最新题集（根据用户名和topic序号最大值）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    
    if (!username) {
      return NextResponse.json(
        { success: false, error: '用户名参数缺失' },
        { status: 400 }
      )
    }

    console.log('🔍 获取最新题集，用户名:', username)
    
    // 获取该用户创建的所有题集
    const userTopics = await topicListAPI.getByCreator(username)
    
    if (!userTopics || userTopics.length === 0) {
      return NextResponse.json(
        { success: false, error: '未找到该用户创建的题集' },
        { status: 404 }
      )
    }

    // 找到序号最大的题集（最新题集）
    const latestTopic = (userTopics as Record<string, unknown>[]).reduce((latest: Record<string, unknown>, current: Record<string, unknown>) => {
      return ((current.row_num as number) > (latest.row_num as number)) ? current : latest
    })

    console.log('📋 找到最新题集:', latestTopic)

    // 获取该题集的题目数据
    const questionsResult = await getQuestionsBySetId(latestTopic.row_num as number)
    
    if (!questionsResult.success) {
      return NextResponse.json(
        { success: false, error: `获取题目数据失败: ${questionsResult.error}` },
        { status: 500 }
      )
    }

    // 返回题集信息和题目数据
    const result = {
      topic: {
        id: latestTopic.id,
        name: latestTopic.name,
        creator: latestTopic.creator,
        status: latestTopic.status,
        description: latestTopic.description,
        row_num: latestTopic.row_num,
        question_count: latestTopic.question_count,
        created_at: latestTopic.created_at
      },
      questions: questionsResult.data || []
    }

    console.log('✅ 成功获取最新题集和题目数据，题目数量:', result.questions.length)
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('❌ 获取最新题集失败:', error)
    return NextResponse.json(
      { success: false, error: '获取最新题集失败' },
      { status: 500 }
    )
  }
}