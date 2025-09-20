import { NextRequest, NextResponse } from 'next/server'
import { userTopicMappingAPI } from '@/lib/supabase'

// GET - 获取所有用户题集映射或特定用户的题集映射
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      // 获取特定用户的题集映射
      const data = await userTopicMappingAPI.getUserTopics(parseInt(userId))
      return NextResponse.json({ success: true, data })
    } else {
      // 获取所有用户题集映射
      const data = await userTopicMappingAPI.getAllMappings()
      return NextResponse.json({ success: true, data })
    }
  } catch (error) {
    console.error('获取用户题集映射失败:', error)
    return NextResponse.json(
      { success: false, error: '获取用户题集映射失败' },
      { status: 500 }
    )
  }
}

// POST - 创建用户题集映射
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, topicId } = body
    
    if (!userId || !topicId) {
      return NextResponse.json(
        { success: false, error: '用户ID和题集ID不能为空' },
        { status: 400 }
      )
    }
    
    const data = await userTopicMappingAPI.addUserTopic(userId, topicId)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('创建用户题集映射失败:', error)
    return NextResponse.json(
      { success: false, error: '创建用户题集映射失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除用户题集映射
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const topicId = searchParams.get('topicId')
    
    if (!userId || !topicId) {
      return NextResponse.json(
        { success: false, error: '用户ID和题集ID不能为空' },
        { status: 400 }
      )
    }
    
    await userTopicMappingAPI.removeUserTopic(parseInt(userId), parseInt(topicId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除用户题集映射失败:', error)
    return NextResponse.json(
      { success: false, error: '删除用户题集映射失败' },
      { status: 500 }
    )
  }
}