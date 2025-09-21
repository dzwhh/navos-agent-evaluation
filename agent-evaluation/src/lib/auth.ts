import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface User {
  id: string;
  username: string;
  role: string;
  email?: string;
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    // 解码JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.userId) {
      return null;
    }

    // 从数据库获取用户信息
    const { data: user, error } = await supabase
      .from('navos_user')
      .select('id, username, role, email')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      console.error('获取用户信息失败:', error);
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role || 'user',
      email: user.email
    };
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}