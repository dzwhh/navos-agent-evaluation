import { NextRequest, NextResponse } from 'next/server';
import { userAPI } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await userAPI.getByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 验证密码
    let isValidPassword = false;
    if (user.password && user.password.startsWith('$2')) {
      // 哈希密码，使用 bcrypt 比较
      isValidPassword = await bcrypt.compare(password, user.password);
    } else if (user.password) {
      // 明文密码，直接比较
      isValidPassword = password === user.password;
    }
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 创建用户会话数据
    const userData = {
      id: user.id,
      username: user.user_name, // 数据库字段名是user_name
      role: user.role,
      created_at: user.created_at
    };

    // 创建响应并设置 cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: userData
    });

    // 设置用户信息到 cookie（7天过期）
    response.cookies.set('user-session', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error in /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}