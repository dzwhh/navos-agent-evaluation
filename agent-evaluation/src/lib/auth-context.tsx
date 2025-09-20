'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/evaluation';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
      // 调用登录API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('登录失败:', errorData.error);
        return false;
      }

      const data = await response.json();
      if (data.user) {
        // 将API返回的用户数据映射到User类型
        const user: User = {
          id: data.user.id.toString(),
          username: data.user.username,
          password: '', // 不存储密码
          role: data.user.role || 'user',
          createdAt: new Date(data.user.created_at || new Date()),
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

  const logout = async () => {
    try {
      // 调用登出API
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
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