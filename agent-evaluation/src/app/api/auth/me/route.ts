import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userAPI } from '@/lib/supabase';

export async function GET() {
  try {
    // 从 cookies 中获取用户信息
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user-session');
    
    if (!userCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 解析用户信息
    let user;
    try {
      user = JSON.parse(userCookie.value);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid user data' },
        { status: 401 }
      );
    }

    // 验证用户是否仍然存在于数据库中
    const dbUser = await userAPI.getById(user.id);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // 返回用户信息
    return NextResponse.json({
      id: dbUser.id,
      username: dbUser.user_name,
      role: dbUser.role,
      created_at: dbUser.created_at
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}