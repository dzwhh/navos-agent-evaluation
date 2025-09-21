'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Shield, Users, FileText, UserCheck, BarChart3, ArrowLeft, Download } from 'lucide-react';

interface DashboardStats {
  userCount: number;
  questionCount: number;
  answeredUserCount: number;
  totalAnswers: number;
}

interface TestResult {
  user_name: string;
  created_at: string;
  q_id: string;
  q_name: string;
  agent_type: string;
  agent_name: string;
  agent_scene: string;
  item_visual: number;
  item_major: number;
  item_data: number;
  item_guide: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    questionCount: 0,
    answeredUserCount: 0,
    totalAnswers: 0
  });
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 获取统计数据
      const statsResponse = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // 获取明细数据
      const resultsResponse = await fetch('/api/dashboard/results', {
        credentials: 'include'
      });
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setTestResults(resultsData);
      }
    } catch (err) {
      setError('获取数据失败');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);
      
      // CSV 头部
      const headers = [
        '答题人',
        '答题时间', 
        '题目ID',
        '题目名称',
        '评分项',
        'Agent名称',
        '场景',
        '结果直观性',
        '结果专业性', 
        '数据充分性',
        '结果指导性'
      ];
      
      // 转换数据为CSV格式
      const csvContent = [
        headers.join(','),
        ...testResults.map(result => [
          `"${result.user_name}"`,
          `"${formatDate(result.created_at)}"`,
          `"${result.q_id}"`,
          `"${result.q_name}"`,
          `"${result.agent_type}"`,
          `"${result.agent_name}"`,
          `"${result.agent_scene}"`,
          result.item_visual || '',
          result.item_major || '',
          result.item_data || '',
          result.item_guide || ''
        ].join(','))
      ].join('\n');
      
      // 创建并下载文件
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `答题明细_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('导出失败:', err);
      setError('导出文件失败');
    } finally {
      setExporting(false);
    }
  };

  // 权限检查：只有admin用户才能访问
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">未登录</h2>
            <p className="text-gray-600 mb-6">请先登录后再访问Dashboard</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              前往登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">权限不足</h2>
            <p className="text-gray-600 mb-6">只有管理员才能访问Dashboard</p>
            <p className="text-sm text-gray-500 mb-6">当前用户：{user?.username} ({user?.role || 'user'})</p>
            <button
              onClick={() => router.push('/home')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/home')}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回首页</span>
              </button>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">管理员：{user?.username}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              重试
            </button>
          </div>
        ) : (
          <>
            {/* 统计指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-3 mr-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">用户数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.userCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-3 mr-4">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">题目数量</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.questionCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-3 mr-4">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">答题人数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.answeredUserCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                <div className="flex items-center">
                  <div className="bg-orange-100 rounded-full p-3 mr-4">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">已答题次数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAnswers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 明细表 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">答题明细</h3>
                <button
                  onClick={exportToCSV}
                  disabled={exporting || testResults.length === 0}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  <span>{exporting ? '导出中...' : '导出文件'}</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        答题人
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        答题时间
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        题目ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        题目名称
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        评分项
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Agent名称
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        场景
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        结果直观性
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        结果专业性
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        数据充分性
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        结果指导性
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testResults.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      testResults.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.user_name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(result.created_at)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.q_id}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 max-w-64 truncate" title={result.q_name}>
                            {result.q_name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.agent_type}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.agent_name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.agent_scene}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              result.item_visual >= 4 ? 'bg-green-100 text-green-800' :
                              result.item_visual >= 3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {result.item_visual || '-'}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              result.item_major >= 4 ? 'bg-green-100 text-green-800' :
                              result.item_major >= 3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {result.item_major || '-'}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              result.item_data >= 4 ? 'bg-green-100 text-green-800' :
                              result.item_data >= 3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {result.item_data || '-'}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              result.item_guide >= 4 ? 'bg-green-100 text-green-800' :
                              result.item_guide >= 3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {result.item_guide || '-'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}