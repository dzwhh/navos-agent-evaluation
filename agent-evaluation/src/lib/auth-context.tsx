'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/evaluation';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 预定义的用户列表（实际项目中应该从数据库获取）
const PREDEFINED_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: '123456',
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
  }
];

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

  const login = (username: string, password: string): boolean => {
    try {
      // 验证用户名和密码
      const user = PREDEFINED_USERS.find(
        u => u.username === username && u.password === password
      );

      if (user) {
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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