import { NextRequest, NextResponse } from 'next/server'
import { topicListAPI } from '@/lib/supabase'

// GET - 获取所有题目集
export async function GET() {
  try {
    const data = await topicListAPI.getAll()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('获取题目集失败:', error)
    return NextResponse.json(
      { success: false, error: '获取题目集失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新题目集
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, creator, description, status, question_count } = body

    if (!name || !creator) {
      return NextResponse.json(
        { success: false, error: '题集名称和创建人不能为空' },
        { status: 400 }
      )
    }

    const topicData = {
      name,
      creator,
      description: description || '',
      status: status !== undefined ? status : true,
      question_count: question_count || 0
    }

    const data = await topicListAPI.create(topicData)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('创建题目集失败:', error)
    return NextResponse.json(
      { success: false, error: '创建题目集失败' },
      { status: 500 }
    )
  }
}

// PUT - 更新题目集
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: '题目集ID不能为空' },
        { status: 400 }
      )
    }

    const data = await topicListAPI.update(id, updateData)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('更新题目集失败:', error)
    return NextResponse.json(
      { success: false, error: '更新题目集失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除题目集
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '题目集ID不能为空' },
        { status: 400 }
      )
    }

    await topicListAPI.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除题目集失败:', error)
    return NextResponse.json(
      { success: false, error: '删除题目集失败' },
      { status: 500 }
    )
  }
}