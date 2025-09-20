'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/evaluation';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      // 检查本地存储中是否有用户信息
      const storedUser = localStorage.getItem('evaluationUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // 将createdAt字符串转换为Date对象
          if (parsedUser.createdAt && typeof parsedUser.createdAt === 'string') {
            parsedUser.createdAt = new Date(parsedUser.createdAt);
          }
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('从本地存储恢复用户信息');
        } catch (e) {
          console.error('Failed to parse user from localStorage', e);
        }
      }
    } catch (error) {
      console.error('检查本地存储时发生错误:', error);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // 从数据库验证用户名和密码
      const { data, error } = await supabase
        .from('navos_user_info')
        .select('*')
        .eq('user_name', username)
        .eq('password', password)
        .single();

      if (error) {
        console.error('数据库查询错误:', error);
        return false;
      }

      if (data) {
        // 将数据库字段映射到User类型
        const user: User = {
          id: (data as any).id.toString(),
          username: (data as any).user_name,
          password: (data as any).password,
          role: (data as any).role || 'user',
          createdAt: new Date((data as any).created_at || new Date()),
        };
        
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('evaluationUser', JSON.stringify(user));
        console.log('登录成功');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('登录过程中发生错误:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('evaluationUser');
      console.log('登出成功');
    } catch (error) {
      console.error('登出过程中发生错误:', error);
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}