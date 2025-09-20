import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 创建响应
    const response = NextResponse.json({
      message: 'Logout successful'
    });

    // 清除用户 cookie
    response.cookies.set('user', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // 立即过期
    });

    return response;
  } catch (error) {
    console.error('Error in /api/auth/logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}