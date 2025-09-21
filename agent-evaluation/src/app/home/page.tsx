'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Settings, BarChart3 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const handleCreateQuestion = () => {
    if (isAdmin()) {
      router.push('/question');
    }
  };

  const handleTakeTest = () => {
    router.push('/evaluation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">AI Agent 评测系统</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">欢迎，{user?.username || '用户'}</span>
              {isAdmin() && (
                <>
                  <button
                    onClick={() => router.push('/user-management')}
                    className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="用户管理"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">用户管理</span>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Dashboard"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm">Dashboard</span>
                  </button>
                </>
              )}
              <button 
                onClick={() => router.push('/login')}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">选择您的操作</h2>
          <p className="text-xl text-gray-600">您可以创建新的测试题目，或者参与现有的评测</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 我要出题 */}
          <div 
            onClick={isAdmin() ? handleCreateQuestion : undefined}
            className={`bg-white rounded-2xl shadow-xl p-8 border border-blue-100 transition-all duration-300 group ${
              isAdmin() 
                ? 'hover:shadow-2xl cursor-pointer transform hover:scale-105' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              <div className={`mx-auto bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-24 h-24 flex items-center justify-center mb-6 transition-all duration-300 ${
                isAdmin() ? 'group-hover:from-green-500 group-hover:to-blue-600' : ''
              }`}>
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold text-gray-800 mb-4 transition-colors ${
                isAdmin() ? 'group-hover:text-blue-600' : ''
              }`}>我要出题</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                创建新的AI Agent评测题目，设计测试场景和评分标准，为AI能力评估贡献您的专业知识。
                {!isAdmin() && <span className="block mt-2 text-sm text-red-500">仅限管理员使用</span>}
              </p>
              <div className={`inline-flex items-center font-semibold transition-colors ${
                isAdmin() 
                  ? 'text-blue-600 group-hover:text-blue-700' 
                  : 'text-gray-400'
              }`}>
                开始创建
                <svg className={`w-5 h-5 ml-2 transition-transform ${
                  isAdmin() ? 'group-hover:translate-x-1' : ''
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 我要做题 */}
          <div 
            onClick={handleTakeTest}
            className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 group"
          >
            <div className="text-center">
              <div className="mx-auto bg-gradient-to-r from-purple-400 to-pink-500 rounded-full w-24 h-24 flex items-center justify-center mb-6 group-hover:from-purple-500 group-hover:to-pink-600 transition-all duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors">我要做题</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                参与AI Agent能力评测，通过实际测试来评估和比较不同AI系统的表现，提供客观的评分反馈。
              </p>
              <div className="inline-flex items-center text-purple-600 font-semibold group-hover:text-purple-700 transition-colors">
                开始评测
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">关于AI Agent评测系统</h4>
            <p className="text-gray-600">
              本系统旨在为AI Agent的能力评估提供标准化的测试平台，通过领域资深专家方式收集高质量的测试用例和评测数据。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}