import React, { useState } from 'react';
import { testSupabaseConnection, saveEvaluationToDatabase } from '../lib/database';

const DatabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string; details?: unknown } | null>(null);
  const [writeResult, setWriteResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
      console.log('连接测试结果:', result);
    } catch (error) {
      console.error('测试连接时发生错误:', error);
      setTestResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestWrite = async () => {
    setLoading(true);
    try {
      const testData = {
        qName: 'Test Question',
        title: 'Database Write Test',
        agentType: 'Test Agent',
        itemVisual: 5,
        itemMajor: 4,
        itemData: 3,
        itemGuide: 5,
        questionIndex: 0, // 这将分配 q_id = 1
        agentName: 'Test Model',
        agentScene: 'test_scene',
        topicId: 1,
        userName: 'test_user'
      };
      
      const result = await saveEvaluationToDatabase(testData);
      setWriteResult(result);
      console.log('写入测试结果:', result);
    } catch (error) {
      console.error('测试写入时发生错误:', error);
      setWriteResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">数据库连接测试</h1>
      
      <div className="space-y-6">
        {/* 连接测试 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">1. 测试 Supabase 连接</h2>
          <button
            onClick={handleTestConnection}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试连接'}
          </button>
          
          {testResult && (
            <div className="mt-4 p-4 rounded bg-gray-50">
              <h3 className="font-semibold mb-2">测试结果:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 写入测试 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">2. 测试数据写入</h2>
          <button
            onClick={handleTestWrite}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试写入'}
          </button>
          
          {writeResult && (
            <div className="mt-4 p-4 rounded bg-gray-50">
              <h3 className="font-semibold mb-2">写入结果:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(writeResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 说明 */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">说明</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>连接测试会验证 Supabase 连接、表结构和权限</li>
            <li>写入测试会尝试插入一条测试数据</li>
            <li>请打开浏览器控制台查看详细的日志信息</li>
            <li>如果测试失败，错误信息会显示在结果中</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest;