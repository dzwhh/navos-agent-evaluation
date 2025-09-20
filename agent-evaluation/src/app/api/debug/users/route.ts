import { NextRequest, NextResponse } from 'next/server';
import { userAPI } from '@/lib/supabase';

export async function GET() {
  try {
    // 获取admin用户信息用于调试
    const adminUser = await userAPI.getByUsername('admin');
    
    return NextResponse.json({
      adminUser: adminUser ? {
        id: adminUser.id,
        user_name: adminUser.user_name,
        email: adminUser.email,
        role: adminUser.role,
        is_active: adminUser.is_active,
        password_length: adminUser.password?.length || 0,
        password_starts_with: adminUser.password?.substring(0, 10) || 'null'
      } : null
    });
  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}