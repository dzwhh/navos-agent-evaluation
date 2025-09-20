'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { getQuestionsBySetId, saveQuestionsToDatabase } from '@/lib/database';
import { topicListAPI } from '@/lib/supabase';

// 模拟数据
const mockQuestionSets = [
  {
    id: 1,
    name: 'AI代理基础能力测试',
    createTime: '2024-01-15',
    creator: '张三',
    status: true,
    description: '测试AI代理的基本对话和理解能力',
    row_num: 1,
    questions: [
      { 
        id: 1, 
        name: '基础对话测试', 
        scenario: '日常对话场景',
        minimaxResult: 'https://example.com/minimax/result1.jpg',
        qwenResult: 'https://example.com/qwen/result1.jpg',
        deepseekResult: 'https://example.com/deepseek/result1.jpg',
        chatgptResult: 'https://example.com/chatgpt/result1.jpg',
        manusResult: 'https://example.com/manus/result1.jpg',
        navosResult: 'https://example.com/navos/result1.jpg'
      },
      { 
        id: 2, 
        name: '逻辑推理测试', 
        scenario: '逻辑推理场景',
        minimaxResult: 'https://example.com/minimax/result2.jpg',
        qwenResult: 'https://example.com/qwen/result2.jpg',
        deepseekResult: 'https://example.com/deepseek/result2.jpg',
        chatgptResult: 'https://example.com/chatgpt/result2.jpg',
        manusResult: 'https://example.com/manus/result2.jpg',
        navosResult: 'https://example.com/navos/result2.jpg'
      },
      { 
        id: 3, 
        name: '知识问答测试', 
        scenario: '知识问答场景',
        minimaxResult: 'https://example.com/minimax/result3.jpg',
        qwenResult: 'https://example.com/qwen/result3.jpg',
        deepseekResult: 'https://example.com/deepseek/result3.jpg',
        chatgptResult: 'https://example.com/chatgpt/result3.jpg',
        manusResult: 'https://example.com/manus/result3.jpg',
        navosResult: 'https://example.com/navos/result3.jpg'
      }
    ]
  },
  {
    id: 2,
    name: '编程能力评估',
    createTime: '2024-01-20',
    creator: '李四',
    status: false,
    description: '评估AI代理的代码生成和调试能力',
    row_num: 2,
    questions: [
      { 
        id: 4, 
        name: 'Python基础编程', 
        scenario: 'Python编程场景',
        minimaxResult: 'https://example.com/minimax/result4.jpg',
        qwenResult: 'https://example.com/qwen/result4.jpg',
        deepseekResult: 'https://example.com/deepseek/result4.jpg',
        chatgptResult: 'https://example.com/chatgpt/result4.jpg',
        manusResult: 'https://example.com/manus/result4.jpg',
        navosResult: 'https://example.com/navos/result4.jpg'
      },
      { 
        id: 5, 
        name: '算法实现测试', 
        scenario: '算法实现场景',
        minimaxResult: 'https://example.com/minimax/result5.jpg',
        qwenResult: 'https://example.com/qwen/result5.jpg',
        deepseekResult: 'https://example.com/deepseek/result5.jpg',
        chatgptResult: 'https://example.com/chatgpt/result5.jpg',
        manusResult: 'https://example.com/manus/result5.jpg',
        navosResult: 'https://example.com/navos/result5.jpg'
      }
    ]
  },
  {
    id: 3,
    name: '多模态理解测试',
    createTime: '2024-01-25',
    creator: '王五',
    status: true,
    description: '测试AI代理对图像、文本等多模态内容的理解',
    row_num: 3,
    questions: [
      { 
        id: 6, 
        name: '图像描述测试', 
        scenario: '图像理解场景',
        minimaxResult: 'https://example.com/minimax/result6.jpg',
        qwenResult: 'https://example.com/qwen/result6.jpg',
        deepseekResult: 'https://example.com/deepseek/result6.jpg',
        chatgptResult: 'https://example.com/chatgpt/result6.jpg',
        manusResult: 'https://example.com/manus/result6.jpg',
        navosResult: 'https://example.com/navos/result6.jpg'
      }
    ]
  }
];

// 字段映射配置
const FIELD_MAPPING = {
  id: ['题目ID', 'ID', 'id', 'question_id', 'questionId'],
  name: ['题目名称', '名称', 'name', 'title', 'question_name', 'questionName'],
  scenario: ['场景', 'scenario', 'scene', 'context', '情境'],
  minimaxResult: ['MiniMax结果', 'MiniMax', 'minimax', 'minimax_result', 'minimaxResult'],
  qwenResult: ['Qwen结果', 'Qwen', 'qwen', 'qwen_result', 'qwenResult'],
  deepseekResult: ['DeepSeek结果', 'DeepSeek', 'deepseek', 'deepseek_result', 'deepseekResult'],
  chatgptResult: ['ChatGPT结果', 'ChatGPT', 'chatgpt', 'chatgpt_result', 'chatgptResult'],
  manusResult: ['Manus结果', 'Manus', 'manus', 'manus_result', 'manusResult'],
  navosResult: ['Navos结果', 'Navos', 'navos', 'navos_result', 'navosResult']
};

interface QuestionSet {
  id: number;
  name: string;
  createTime: string;
  creator: string;
  status: boolean;
  description: string;
  row_num: number;
  questions: unknown[];
}

function QuestionPageContent() {
  console.log('🚀 QuestionPage 组件开始渲染');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [isLoadingSets, setIsLoadingSets] = useState(true);
  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null);
  const [selectedSetQuestions, setSelectedSetQuestions] = useState<Record<string, unknown>[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [useFieldMapping, setUseFieldMapping] = useState(true);
  const [editingNameId, setEditingNameId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [savingNameId, setSavingNameId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  
  console.log('🚀 QuestionPage 状态初始化完成');
  console.log('🚀 当前URL参数:', searchParams?.get('topicId'));
  console.log('🚀 questionSets长度:', questionSets.length);
  console.log('🚀 selectedSetQuestions长度:', selectedSetQuestions.length);

  // 定义loadTopicSets函数
  const loadTopicSets = async () => {
    console.log('🔥🔥🔥 loadTopicSets 函数被调用了！！！');
    try {
      console.log('📋 开始加载题目集列表...');
      setIsLoadingSets(true);
      const data = await topicListAPI.getAll() as Record<string, unknown>[];
      console.log('📋 从数据库获取的原始数据:', data);
      
      // 转换数据库数据为前端格式
      const formattedSets = data.map(item => ({
        id: item.id as number,
        name: item.name as string,
        createTime: (item.created_at as string).split('T')[0],
        creator: item.creator as string,
        status: item.status as boolean,
        description: (item.description as string) || '',
        row_num: item.row_num as number, // 添加序号字段
        questions: [] // 题目数据按需加载
      }));
      
      console.log('📋 转换后的题目集数据:', formattedSets);
      setQuestionSets(formattedSets);
      console.log('✅ 题目集列表加载成功，数量:', formattedSets.length);
      
      // 手动处理URL参数，自动选择题集
      const topicId = searchParams?.get('topicId');
      console.log('🔵 手动处理URL参数，topicId:', topicId);
      if (topicId && formattedSets.length > 0) {
        const targetSet = formattedSets.find(set => set.id === parseInt(topicId));
        console.log('🔵 查找目标题集，topicId:', parseInt(topicId), 'targetSet:', targetSet);
        if (targetSet) {
          console.log('🔵 手动选择题集:', targetSet);
          setTimeout(() => {
            selectQuestionSet(targetSet, true);
          }, 100);
        } else {
          console.log('🔵 未找到匹配的题集');
        }
      }
    } catch (error) {
      console.error('❌ 加载题目集列表失败:', error);
      console.log('🔄 使用模拟数据作为后备');
      // 如果数据库加载失败，使用模拟数据作为后备
      setQuestionSets(mockQuestionSets);
      toast.error('加载题目集列表失败', {
        description: '无法从数据库获取数据，显示模拟数据',
        duration: 4000
      });
    } finally {
      setIsLoadingSets(false);
    }
  };

  // 从数据库加载题目集列表
  useEffect(() => {
    console.log('🔥🔥🔥 useEffect 被触发，准备调用 loadTopicSets');
    console.log('🔥🔥🔥 useEffect 依赖数组:', []);
    console.log('🔥🔥🔥 loadTopicSets 函数类型:', typeof loadTopicSets);
    loadTopicSets();
  }, []);

  // 立即调用测试 - 强制执行
  console.log('🔥🔥🔥 组件渲染时强制调用 loadTopicSets');
  console.log('🔥🔥🔥 当前状态: questionSets.length=', questionSets.length, 'isLoadingSets=', isLoadingSets);
  
  // 强制调用一次，不管条件如何
  if (questionSets.length === 0) {
    console.log('🔥🔥🔥 强制调用 loadTopicSets');
    setTimeout(() => {
      loadTopicSets();
    }, 0);
  }

  // 处理URL参数，自动选择题集
  useEffect(() => {
    console.log('🔵🔵🔵 URL参数处理useEffect被触发');
    const topicId = searchParams?.get('topicId');
    console.log('🔵 URL参数变化，topicId:', topicId, 'selectedSet:', selectedSet?.id);
    console.log('🔵 questionSets状态:', questionSets.length, questionSets);
    
    if (topicId && questionSets.length > 0) {
      const targetSet = questionSets.find(set => set.id === parseInt(topicId));
      console.log('🔵 查找目标题集，topicId:', parseInt(topicId), 'targetSet:', targetSet);
      if (targetSet && (!selectedSet || selectedSet.id !== parseInt(topicId))) {
        console.log('🔵 从URL参数自动选择题集:', targetSet);
        selectQuestionSet(targetSet, true); // 传入skipRouterPush=true避免循环路由
      } else {
        console.log('🔵 未找到匹配的题集或已选中相同题集');
      }
    } else {
      console.log('🔵 条件不满足: topicId存在?', !!topicId, 'questionSets长度:', questionSets.length);
    }
    // 移除自动清除逻辑，避免与closeDetail函数冲突
  }, [searchParams, questionSets, selectedSet]);

  // 下载示例CSV文件
  const downloadSampleCSV = () => {
    const sampleData = [
      ['题目ID', '题目名称', '场景', 'MiniMax结果', 'Qwen结果', 'DeepSeek结果', 'ChatGPT结果', 'Manus结果', 'Navos结果'],
      ['1', '示例题目1', '对话场景', 'https://example.com/minimax1.jpg', 'https://example.com/qwen1.jpg', 'https://example.com/deepseek1.jpg', 'https://example.com/chatgpt1.jpg', 'https://example.com/manus1.jpg', 'https://example.com/navos1.jpg'],
      ['2', '示例题目2', '推理场景', 'https://example.com/minimax2.jpg', 'https://example.com/qwen2.jpg', 'https://example.com/deepseek2.jpg', 'https://example.com/chatgpt2.jpg', 'https://example.com/manus2.jpg', 'https://example.com/navos2.jpg'],
      ['3', '示例题目3', '创作场景', 'https://example.com/minimax3.jpg', 'https://example.com/qwen3.jpg', 'https://example.com/deepseek3.jpg', 'https://example.com/chatgpt3.jpg', 'https://example.com/manus3.jpg', 'https://example.com/navos3.jpg']
    ];
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_questions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleStatus = async (id: number) => {
    try {
      // 找到当前题目集
      const currentSet = questionSets.find(set => set.id === id);
      if (!currentSet) return;
      
      // 更新数据库
      await topicListAPI.update(id, { status: !currentSet.status });
      
      // 更新本地状态
      setQuestionSets(prev => 
        prev.map(set => 
          set.id === id ? { ...set, status: !set.status } : set
        )
      );
      
      toast.success('状态更新成功');
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('状态更新失败', {
        description: '无法更新题目集状态，请重试',
        duration: 4000
      });
    }
  };

  // 开始编辑名称
  const startEditName = (id: number, currentName: string) => {
    setEditingNameId(id);
    setEditingName(currentName);
  };

  // 保存名称编辑
  const saveNameEdit = async (id: number) => {
    const trimmedName = editingName.trim();
    
    // 表单验证
    if (!trimmedName) {
      toast.error('题集名称不能为空');
      return;
    }
    
    if (trimmedName.length < 2) {
      toast.error('题集名称至少需要2个字符');
      return;
    }
    
    if (trimmedName.length > 50) {
      toast.error('题集名称不能超过50个字符');
      return;
    }
    
    // 检查重复名称（排除当前编辑的题集）
    const isDuplicate = questionSets.some(set => 
      set.id !== id && set.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      toast.error('题集名称已存在，请使用其他名称');
      return;
    }

    // 保存原始名称用于回滚
    const originalName = questionSets.find(set => set.id === id)?.name;
    if (!originalName) {
      toast.error('找不到要编辑的题集');
      return;
    }

    // 设置加载状态
    setSavingNameId(id);
    
    try {
      // 先乐观更新本地状态
      setQuestionSets(prev => 
        prev.map(set => 
          set.id === id ? { ...set, name: trimmedName } : set
        )
      );
      
      // 如果当前选中的题集被编辑，也要更新选中状态
      if (selectedSet && selectedSet.id === id) {
        setSelectedSet(prev => prev ? { ...prev, name: trimmedName } : null);
      }
      
      // 更新数据库
      await topicListAPI.update(id, { name: trimmedName });
      
      // 成功后清除编辑状态
      setEditingNameId(null);
      setEditingName('');
      toast.success('题集名称更新成功', {
        description: `已将题集名称更新为「${trimmedName}」`,
        duration: 3000
      });
    } catch (error) {
      console.error('更新题集名称失败:', error);
      
      // 回滚本地状态
      setQuestionSets(prev => 
        prev.map(set => 
          set.id === id ? { ...set, name: originalName } : set
        )
      );
      
      // 回滚选中状态
      if (selectedSet && selectedSet.id === id) {
        setSelectedSet(prev => prev ? { ...prev, name: originalName } : null);
      }
      
      // 恢复编辑状态，让用户可以重新尝试
      setEditingName(originalName);
      
      // 显示详细错误信息
      let errorMessage = '无法更新题集名称，请重试';
      const errorObj = error as Error;
      if (errorObj.message) {
        if (errorObj.message.includes('network') || errorObj.message.includes('fetch')) {
          errorMessage = '网络连接失败，请检查网络后重试';
        } else if (errorObj.message.includes('permission') || errorObj.message.includes('unauthorized')) {
          errorMessage = '没有权限修改此题集';
        } else if (errorObj.message.includes('not found')) {
          errorMessage = '题集不存在或已被删除';
        } else {
          errorMessage = errorObj.message;
        }
      }
      
      toast.error('更新题集名称失败', {
        description: errorMessage,
        duration: 5000,
        action: {
          label: '重试',
          onClick: () => saveNameEdit(id)
        }
      });
    } finally {
      setSavingNameId(null);
    }
  };

  // 取消编辑名称
  const cancelNameEdit = () => {
    setEditingNameId(null);
    setEditingName('');
  };

  // 删除题集
  const deleteQuestionSet = async (id: number) => {
    try {
      // 删除数据库记录
      await topicListAPI.delete(id);
      
      // 更新本地状态
      setQuestionSets(prev => prev.filter(set => set.id !== id));
      
      // 如果删除的是当前选中的题集，清除选中状态
      if (selectedSet && selectedSet.id === id) {
        setSelectedSet(null);
        setSelectedSetQuestions([]);
      }
      
      setShowDeleteConfirm(null);
      toast.success('题集删除成功');
    } catch (error) {
      console.error('删除题集失败:', error);
      toast.error('删除题集失败', {
        description: '无法删除题集，请重试',
        duration: 4000
      });
    }
  };

  const selectQuestionSet = async (questionSet: QuestionSet, skipRouterPush = false) => {
    console.log('🎯 选择题集:', questionSet);
    console.log('🎯 题集ID:', questionSet.id, '类型:', typeof questionSet.id);
    
    setSelectedSet(questionSet);
    setIsLoadingQuestions(true);
    setSelectedSetQuestions([]);
    console.log('🔄 状态重置完成: selectedSet已设置, isLoadingQuestions=true, selectedSetQuestions=[]');
    
    // 只有在不是从URL参数触发时才更新路由
    if (!skipRouterPush) {
      const topicId = questionSet.id;
      router.push(`/question?topicId=${topicId}`, { scroll: false });
      console.log('🎯 路由跳转到:', `/question?topicId=${topicId}`);
    }
    
    try {
      // 从数据库获取题目数据，根据题集ID过滤
      console.log('🔄 开始调用 getQuestionsBySetId，参数:', questionSet.id);
      const result = await getQuestionsBySetId(questionSet.id);
      console.log('🔄 getQuestionsBySetId 返回结果:', result);
      console.log('🔄 返回数据类型:', typeof result.data, '数据长度:', result.data?.length);
      
      if (result.success && result.data && result.data.length > 0) {
        // 将数据库数据转换为前端需要的格式，使用getQuestionsBySetId返回的字段名
        const dataArray = result.data as Record<string, unknown>[];
        const questions = dataArray.map((item) => ({
          q_id: item.id,
          q_name: item.name,
          agent_scene: item.scenario,
          minimax: item.minimaxResult,
          qwen: item.qwenResult,
          deepseek: item.deepseekResult,
          chatgpt: item.chatgptResult,
          manus: item.manusResult,
          navos: item.navosResult
        }));
        
        console.log('🔄 字段映射后的数据预览:', questions.slice(0, 2));
        
        console.log('🔄 准备设置 selectedSetQuestions，数据:', questions);
        setSelectedSetQuestions(questions);
        console.log('✅ 成功加载题目数据:', questions.length, '个题目');
        console.log('✅ 题目数据预览:', questions.slice(0, 2));
        console.log('🔄 状态设置完成，数据已传递给setSelectedSetQuestions');
      } else {
        console.error('❌ 获取题目数据失败或数据为空:', result.error || '数据为空');
        console.log('🔄 使用本地模拟数据作为后备');
        // 如果数据库中没有数据，使用本地模拟数据作为后备
        const fallbackQuestions = questionSet.questions || [];
        console.log('🔄 后备数据:', fallbackQuestions);
        setSelectedSetQuestions(fallbackQuestions as Record<string, unknown>[]);
      }
    } catch (error) {
      console.error('💥 加载题目数据时出错:', error);
      // 出错时使用本地模拟数据作为后备
      const fallbackQuestions = questionSet.questions || [];
      console.log('💥 错误后备数据:', fallbackQuestions);
      setSelectedSetQuestions(fallbackQuestions as Record<string, unknown>[]);
      toast.error('加载题目数据失败', {
        description: '无法从数据库获取题目数据，请重试',
        duration: 4000
      });
    } finally {
      setIsLoadingQuestions(false);
      console.log('🔄 加载完成，isLoadingQuestions=false');
    }
  };

  const closeDetail = () => {
    console.log('🔴 closeDetail 函数被调用');
    console.log('🔴 当前 selectedSet:', selectedSet);
    console.log('🔴 当前 URL:', window.location.href);
    
    try {
      // 使用 router.push 来清除URL参数，这样可以避免与useEffect的竞争条件
      console.log('🔴 步骤1: 使用router清除URL参数');
      router.push('/question', { scroll: false });
      console.log('🔴 router.push 调用完成');
      
      // 立即清除状态
      console.log('🔴 步骤2: 清除状态');
      setSelectedSet(null);
      setSelectedSetQuestions([]);
      console.log('🔴 状态清除完成');
      
      console.log('🔴 closeDetail 函数执行完成');
    } catch (error) {
      console.error('🔴 closeDetail 函数执行出错:', error);
    }
  };

  // 监听selectedSetQuestions状态变化
  useEffect(() => {
    console.log('🔍 selectedSetQuestions 状态变化:', {
      length: selectedSetQuestions.length,
      data: selectedSetQuestions.slice(0, 2)
    });
  }, [selectedSetQuestions]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const allowedTypes = ['.json', '.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('文件格式不支持', {
        description: '请上传支持的文件格式：JSON、CSV、Excel (.xlsx/.xls)',
        duration: 4000
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // 显示开始上传的提示
    toast.info('开始处理文件', {
      description: '正在读取和解析文件内容...',
      duration: 2000
    });

    try {
      // 模拟文件上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 读取文件内容
      const fileContent = await readFileContent(file, fileExtension);
      
      // 解析文件并创建题集
      const newQuestionSet = await parseFileToQuestionSet(fileContent, file.name, fileExtension);
      
      // 保存题目集到数据库
      const topicData = {
        name: newQuestionSet.name,
        creator: newQuestionSet.creator,
        status: newQuestionSet.status,
        description: newQuestionSet.description,
        question_count: newQuestionSet.questions.length
      };
      
      const savedTopic = await topicListAPI.create(topicData) as Record<string, unknown>;
      
      // 保存题目数据到数据库，传入题集名称和ID
      const saveResult = await saveQuestionsToDatabase(newQuestionSet.questions, newQuestionSet.name, savedTopic.id as number);
      
      if (!saveResult.success) {
        throw new Error(`题目数据保存失败: ${saveResult.error}`);
      }
      
      // 完成上传
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // 更新题目集，使用数据库返回的ID
      const updatedQuestionSet = {
        ...newQuestionSet,
        id: savedTopic.id as number,
        createTime: (savedTopic.created_at as string).split('T')[0],
        row_num: questionSets.length + 1
      };
      
      // 添加到题集列表
      setQuestionSets(prev => [...prev, updatedQuestionSet]);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        toast.success('题集创建成功并已同步到数据库！', {
          description: `成功导入 ${newQuestionSet.questions.length} 个题目`,
          duration: 3000
        });
      }, 500);
      
    } catch (error) {
      console.error('文件上传失败:', error);
      
      // 分类处理不同类型的错误
      let errorTitle = '文件上传失败';
      let errorDescription = '';
      
      const errorObj = error as Error;
      if (errorObj.message) {
        if (errorObj.message.includes('字段映射验证失败')) {
          errorTitle = '字段映射失败';
          errorDescription = '请检查CSV文件的列名是否正确，或关闭字段映射功能';
        } else if (errorObj.message.includes('列数不匹配')) {
          errorTitle = 'CSV格式错误';
          errorDescription = '文件列数不符合要求，请检查文件格式';
        } else if (errorObj.message.includes('数据库')) {
          errorTitle = '数据库同步失败';
          errorDescription = '文件解析成功但保存到数据库时出错，请重试';
        } else if (errorObj.message.includes('文件读取失败')) {
          errorTitle = '文件读取失败';
          errorDescription = '无法读取文件内容，请检查文件是否损坏';
        } else {
          errorDescription = errorObj.message;
        }
      } else {
        errorDescription = '请检查文件格式和内容是否正确';
      }
      
      toast.error(errorTitle, {
        description: errorDescription,
        duration: 5000
      });
      
      setIsUploading(false);
      setUploadProgress(0);
    }

    // 清空文件输入
    event.target.value = '';
  };

  // CSV行解析函数，正确处理包含逗号的字段
  const parseCSVLine = (line: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // 转义的双引号
          current += '"';
          i++; // 跳过下一个引号
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // 字段分隔符（不在引号内）
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // 添加最后一个字段
    result.push(current.trim());
    
    return result;
  };

  const readFileContent = (file: File, extension: string) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (!e.target) {
            reject(new Error('文件读取失败'));
            return;
          }
          if (extension === '.json') {
            resolve(JSON.parse(e.target.result as string));
          } else if (extension === '.csv') {
            resolve(e.target.result);
          } else {
            // Excel文件需要特殊处理，这里简化为文本
            resolve(e.target.result);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('文件读取失败'));
      
      if (extension === '.json' || extension === '.csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // 字段映射验证函数
  const validateFieldMapping = (headers: string[]) => {
    const trimmedHeaders = headers.map(h => h.trim());
    const mappingResult: Record<string, number> = {};
    const missingFields: string[] = [];
    
    // 为每个字段找到对应的列索引
    Object.keys(FIELD_MAPPING).forEach(field => {
      const possibleNames = FIELD_MAPPING[field as keyof typeof FIELD_MAPPING];
      let foundIndex = -1;
      
      for (let i = 0; i < trimmedHeaders.length; i++) {
        if (possibleNames.some(name => 
          name.toLowerCase() === trimmedHeaders[i].toLowerCase()
        )) {
          foundIndex = i;
          break;
        }
      }
      
      if (foundIndex !== -1) {
        mappingResult[field] = foundIndex;
      } else {
        missingFields.push(field);
      }
    });
    
    // 检查是否有未匹配的列（已移除未使用的代码）
    
    // 检查必需字段
    const requiredFields = ['name']; // 至少需要题目名称
    const missingRequiredFields = requiredFields.filter(field => 
      !mappingResult.hasOwnProperty(field)
    );
    
    if (missingRequiredFields.length > 0) {
      const expectedNames = missingRequiredFields.map(field => 
        FIELD_MAPPING[field as keyof typeof FIELD_MAPPING].join('、')
      ).join('；');
      throw new Error(`缺少必需字段。期望的列名：${expectedNames}`);
    }
    
    return {
      mapping: mappingResult,
      missingFields: missingFields.filter(field => !requiredFields.includes(field))
    };
  };
  
  // CSV列顺序解析规则（向后兼容）
  const validateCSVStructure = (headers: string[]) => {
    const trimmedHeaders = headers.map(h => h.trim());
    
    // 检查列数是否为9列（标准格式：题目ID、题目名称、场景、MiniMax结果、Qwen结果、DeepSeek结果、ChatGPT结果、Manus结果、Navos结果）
    if (trimmedHeaders.length !== 9) {
      throw new Error(`CSV文件列数不匹配。期望9列，实际${trimmedHeaders.length}列\n\n按列顺序解析规则：\n第1列=题目ID，第2列=题目名称，第3列=场景\n第4列=MiniMax结果，第5列=Qwen结果，第6列=DeepSeek结果\n第7列=ChatGPT结果，第8列=Manus结果，第9列=Navos结果\n\n注意：列名可以自定义，但列的顺序必须按上述规则排列`);
    }
    
    return true;
  };

  const parseFileToQuestionSet = async (fileContent: unknown, fileName: string, extension: string) => {
    let questions: unknown[] = [];
    
    try {
      if (extension === '.json') {
        // 假设JSON格式包含questions数组
        questions = ((fileContent as Record<string, unknown>).questions as unknown[]) || [];
      } else if (extension === '.csv') {
        // CSV解析支持字段映射和向后兼容
        const lines = (fileContent as string).split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV文件至少需要包含表头和一行数据');
        }
        
        const headers = parseCSVLine(lines[0]);
        let fieldMapping = null;
        let useMapping = useFieldMapping;
        
        try {
          // 尝试字段映射验证
          if (useMapping) {
            const mappingResult = validateFieldMapping(headers);
            fieldMapping = mappingResult.mapping;
            
            // 字段映射成功，继续处理
          }
        } catch (mappingError) {
          // 如果字段映射失败，显示详细错误信息
          const errorObj = mappingError as Error;
          if (errorObj.message.includes('未找到必需字段') || errorObj.message.includes('未匹配的列')) {
            throw new Error(`字段映射验证失败：${errorObj.message}\n\n请检查CSV文件的列名是否与以下字段匹配：\n- 题目ID: ${FIELD_MAPPING.id.join(', ')}\n- 题目名称: ${FIELD_MAPPING.name.join(', ')}\n- 场景描述: ${FIELD_MAPPING.scenario.join(', ')}\n\n或者关闭字段映射功能使用按列顺序解析。`);
          }
          // 其他错误回退到按顺序解析
          console.warn('字段映射失败，回退到按顺序解析:', errorObj.message);
          useMapping = false;
          validateCSVStructure(headers);
        }
        
        // 解析数据行
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          
          if (values.length !== headers.length) {
            throw new Error(`第${i + 1}行数据列数不匹配。期望${headers.length}列，实际${values.length}列`);
          }
          
          let question;
          
          if (useMapping && fieldMapping) {
            // 使用字段映射解析
            question = {
              id: fieldMapping.id !== undefined ? (values[fieldMapping.id] ? parseInt(values[fieldMapping.id]) : Date.now() + i) : Date.now() + i,
              name: fieldMapping.name !== undefined ? (values[fieldMapping.name] || `题目${i}`) : `题目${i}`,
              scenario: fieldMapping.scenario !== undefined ? (values[fieldMapping.scenario] || '通用场景') : '通用场景',
              minimaxResult: fieldMapping.minimaxResult !== undefined ? (values[fieldMapping.minimaxResult] || 'https://example.com/default.jpg') : 'https://example.com/default.jpg',
              qwenResult: fieldMapping.qwenResult !== undefined ? (values[fieldMapping.qwenResult] || 'https://example.com/default.jpg') : 'https://example.com/default.jpg',
              deepseekResult: fieldMapping.deepseekResult !== undefined ? (values[fieldMapping.deepseekResult] || 'https://example.com/default.jpg') : 'https://example.com/default.jpg',
              chatgptResult: fieldMapping.chatgptResult !== undefined ? (values[fieldMapping.chatgptResult] || 'https://example.com/default.jpg') : 'https://example.com/default.jpg',
              manusResult: fieldMapping.manusResult !== undefined ? (values[fieldMapping.manusResult] || 'https://example.com/default.jpg') : 'https://example.com/default.jpg',
              navosResult: fieldMapping.navosResult !== undefined ? (values[fieldMapping.navosResult] || 'https://example.com/default.jpg') : 'https://example.com/default.jpg'
            };
          } else {
            // 按列位置解析（向后兼容）：第1列=ID，第2列=名称，第3列=场景，后续列为各AI结果
            question = {
              id: values[0] ? parseInt(values[0]) : Date.now() + i,
              name: values[1] || `题目${i}`,
              scenario: values[2] || '通用场景',
              minimaxResult: values[3] || 'https://example.com/default.jpg',
              qwenResult: values[4] || 'https://example.com/default.jpg',
              deepseekResult: values[5] || 'https://example.com/default.jpg',
              chatgptResult: values[6] || 'https://example.com/default.jpg',
              manusResult: values[7] || 'https://example.com/default.jpg',
              navosResult: values[8] || 'https://example.com/default.jpg'
            };
          }
          
          questions.push(question);
        }
      } else {
        // Excel文件处理（简化版）
        questions = [
          {
            id: Date.now(),
            name: '从Excel导入的题目',
            scenario: 'Excel导入场景',
            minimaxResult: 'https://example.com/default.jpg',
            qwenResult: 'https://example.com/default.jpg',
            deepseekResult: 'https://example.com/default.jpg',
            chatgptResult: 'https://example.com/default.jpg',
            manusResult: 'https://example.com/default.jpg',
            navosResult: 'https://example.com/default.jpg'
          }
        ];
      }
    } catch (error) {
      console.error('文件解析失败:', error);
      throw error; // 直接抛出原始错误，保留详细信息
    }

    return {
      id: Date.now(),
      name: fileName.replace(/\.[^/.]+$/, ''),
      createTime: new Date().toISOString().split('T')[0],
      creator: user?.username || '当前用户',
      status: true,
      description: `从文件 ${fileName} 导入的题集`,
      questions: questions
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/home')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">题目集管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">欢迎，{user?.username || '用户'}</span>
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
      <div className="w-full py-8">
        <div className={`flex flex-col lg:flex-row gap-3 ${selectedSet ? 'h-[calc(100vh-200px)]' : ''}`}>
          {/* Left Panel - Question Sets List */}
          <div className={`${selectedSet ? 'lg:w-1/5 w-full pl-4 sm:pl-6 lg:pl-8' : 'w-full px-4 sm:px-6 lg:px-8'} transition-all duration-300 ease-in-out`}>
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-0.5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">题目集列表</h2>
                <p className="text-gray-600 mt-1">管理和查看所有题目集</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                {/* 字段映射配置 */}
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-sm">
                  <label className="flex items-center gap-2 font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={useFieldMapping}
                      onChange={(e) => setUseFieldMapping(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    启用字段映射
                  </label>
                  <span className="text-xs text-gray-500">
                    {useFieldMapping ? '根据列名匹配字段' : '按列顺序解析'}
                  </span>
                </div>
                
                {/* 上传文件按钮 */}
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".json,.csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <div className="flex items-center gap-1 sm:gap-2">
                    <label 
                      htmlFor="file-upload"
                      className={`${
                        selectedSet 
                          ? 'px-1.5 py-1 text-xs sm:px-2 sm:py-1.5 sm:text-xs lg:px-4 lg:py-1.5' 
                          : 'px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-sm'
                      } bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition flex items-center cursor-pointer shadow-sm min-w-0 ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <svg className={`${
                        selectedSet 
                          ? 'w-3 h-3 mr-0.5 sm:w-4 sm:h-4 sm:mr-1' 
                          : 'w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2'
                      } flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="whitespace-nowrap truncate">
                        {isUploading ? '上传中...' : (selectedSet ? '上传' : '上传文件')}
                      </span>
                    </label>
                    
                    <button
                      onClick={downloadSampleCSV}
                      className={`${
                        selectedSet 
                          ? 'px-1.5 py-1 text-xs sm:px-2 sm:py-1.5 sm:text-xs lg:px-4 lg:py-1.5' 
                          : 'px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-sm'
                      } bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center shadow-sm min-w-0`}
                    >
                      <svg className={`${
                        selectedSet 
                          ? 'w-3 h-3 mr-0.5 sm:w-4 sm:h-4 sm:mr-1' 
                          : 'w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2'
                      } flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="whitespace-nowrap truncate">
                        {selectedSet ? '模板' : '下载模板'}
                      </span>
                    </button>
                  </div>
                  
                  {/* 上传进度条 */}
                  {isUploading && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border p-3 z-10">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>上传进度</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        序号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        题集名称
                      </th>
                      {!selectedSet && (
                        <>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建人</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoadingSets ? (
                      <tr>
                        <td colSpan={selectedSet ? 2 : 6} className="px-6 py-12 text-center">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">正在加载题目集数据...</span>
                          </div>
                        </td>
                      </tr>
                    ) : questionSets.length === 0 ? (
                      <tr>
                        <td colSpan={selectedSet ? 2 : 6} className="px-6 py-12 text-center text-gray-500">
                          暂无题目集数据
                        </td>
                      </tr>
                    ) : (
                      questionSets.map((set, index) => (
                        <tr 
                          key={set.id} 
                          className={`hover:bg-gray-50 transition-colors ${
                            selectedSet?.id === set.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{set.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingNameId === set.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      saveNameEdit(set.id);
                                    } else if (e.key === 'Escape') {
                                      cancelNameEdit();
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => saveNameEdit(set.id)}
                                  disabled={savingNameId === set.id}
                                  className={`p-1 transition-colors ${
                                    savingNameId === set.id 
                                      ? 'text-gray-400 cursor-not-allowed' 
                                      : 'text-green-600 hover:text-green-800'
                                  }`}
                                >
                                  {savingNameId === set.id ? (
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                                <button
                                  onClick={cancelNameEdit}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 flex items-center space-x-2"
                                onClick={() => {
                                  if (!selectedSet || selectedSet.id !== set.id) {
                                    selectQuestionSet(set);
                                  }
                                }}
                              >
                                <span>{set.name}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditName(set.id, set.name);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </td>
                          {!selectedSet && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{set.createTime}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{set.creator}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStatus(set.id);
                                  }}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                    set.status ? 'bg-green-600' : 'bg-gray-200'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      set.status ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{set.description}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(set.id);
                                  }}
                                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                  title="删除题集"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Panel - Detail View */}
          {selectedSet && (
            <div className="lg:w-4/5 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out mr-8 pr-2">
              <div className="flex flex-col h-full">
                {/* Detail Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">题集详情</h3>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        closeDetail();
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto p-8">
                  <div>
                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-gray-800 mb-3">{selectedSet.name}</h4>
                      <p className="text-gray-600 mb-6 text-lg">{selectedSet.description}</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 text-sm">
                        <div>
                          <span className="text-gray-500">创建时间：</span>
                          <span className="text-gray-800">{selectedSet.createTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">创建人：</span>
                          <span className="text-gray-800">{selectedSet.creator}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">状态：</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedSet.status 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedSet.status ? '启用' : '禁用'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">题目数量：</span>
                          <span className="text-gray-800">{selectedSetQuestions.length}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xl font-semibold text-gray-800 mb-6">题目列表</h5>

                      {isLoadingQuestions ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">正在加载题目数据...</span>
                        </div>
                      ) : selectedSetQuestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                          <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-lg font-medium mb-2">暂无题目数据</p>
                          <p className="text-sm text-gray-400">该题集中还没有添加任何题目</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-100 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 min-w-[60px]">题目ID</th>
                                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 max-w-[240px]">题目名称</th>
                                <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 min-w-[80px]">场景</th>
                                <th className="px-2 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 min-w-[80px]">MiniMax</th>
                                <th className="px-2 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 min-w-[80px]">Qwen</th>
                                <th className="px-2 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 min-w-[80px]">DeepSeek</th>
                                <th className="px-2 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 min-w-[80px]">ChatGPT</th>
                                <th className="px-2 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 min-w-[80px]">Manus</th>
                                <th className="px-2 lg:px-6 py-3 lg:py-4 text-center text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 min-w-[80px]">Navos</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {selectedSetQuestions.length > 0 ? selectedSetQuestions.map((question, index) => (
                                 <tr key={`question-${question.id || index}`} className="hover:bg-gray-50">
                                   <td className="px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-900 border-b border-gray-100">{question.q_id as string}</td>
                                   <td className="px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium text-gray-900 border-b border-gray-100 max-w-[240px] break-words whitespace-normal leading-relaxed" title={question.q_name as string} style={{wordBreak: 'break-all', overflowWrap: 'break-word'}}>{question.q_name as string}</td>
                                   <td className="px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-600 border-b border-gray-100 max-w-[80px] truncate" title={question.agent_scene as string}>{question.agent_scene as string}</td>
                                   <td className="px-2 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm border-b border-gray-100">
                                     <div className="flex justify-center">
                                       {question.minimax ? (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg overflow-hidden">
                                           <Image 
                                             src={question.minimax as string} 
                                             alt="MiniMax Result" 
                                             width={48}
                                             height={48}
                                             className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                             onClick={() => {
                                               const params = new URLSearchParams({
                                                 url: encodeURIComponent(question.minimax as string),
                                                 title: 'MiniMax 结果图片',
                                                 model: 'MiniMax',
                                                 question: (question.q_name as string) || `题目 ${question.q_id as string}`
                                               });
                                               window.open(`/image?${params.toString()}`, '_blank');
                                             }}
                                             onError={(e) => {
                                               (e.target as HTMLImageElement).src = "https://via.placeholder.com/48x48/e5e7eb/6b7280?text=MiniMax";
                                             }}
                                             unoptimized
                                           />
                                         </div>
                                       ) : (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                           <span className="text-xs text-gray-500">暂无</span>
                                         </div>
                                       )}
                                     </div>
                                   </td>
                                   <td className="px-2 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm border-b border-gray-100">
                                     <div className="flex justify-center">
                                       {question.qwen ? (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg overflow-hidden">
                                           <Image 
                                             src={question.qwen as string} 
                                             alt="Qwen Result" 
                                             width={48}
                                             height={48}
                                             className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                             onClick={() => {
                                               const params = new URLSearchParams({
                                                 url: encodeURIComponent(question.qwen as string),
                                                 title: 'Qwen 结果图片',
                                                 model: 'Qwen',
                                                 question: (question.q_name as string) || `题目 ${question.q_id as string}`
                                               });
                                               window.open(`/image?${params.toString()}`, '_blank');
                                             }}
                                             onError={(e) => {
                                               (e.target as HTMLImageElement).src = "https://via.placeholder.com/48x48/e5e7eb/6b7280?text=Qwen";
                                             }}
                                             unoptimized
                                           />
                                         </div>
                                       ) : (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                           <span className="text-xs text-gray-500">暂无</span>
                                         </div>
                                       )}
                                     </div>
                                   </td>
                                   <td className="px-2 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm border-b border-gray-100">
                                     <div className="flex justify-center">
                                       {question.deepseek ? (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg overflow-hidden">
                                           <Image 
                                             src={question.deepseek as string} 
                                             alt="DeepSeek Result" 
                                             width={48}
                                             height={48}
                                             className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                             onClick={() => {
                                               const params = new URLSearchParams({
                                                 url: encodeURIComponent(question.deepseek as string),
                                                 title: 'DeepSeek 结果图片',
                                                 model: 'DeepSeek',
                                                 question: (question.q_name as string) || `题目 ${question.q_id as string}`
                                               });
                                               window.open(`/image?${params.toString()}`, '_blank');
                                             }}
                                             onError={(e) => {
                                               (e.target as HTMLImageElement).src = "https://via.placeholder.com/48x48/e5e7eb/6b7280?text=DeepSeek";
                                             }}
                                             unoptimized
                                           />
                                         </div>
                                       ) : (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                           <span className="text-xs text-gray-500">暂无</span>
                                         </div>
                                       )}
                                     </div>
                                   </td>
                                   <td className="px-2 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm border-b border-gray-100">
                                     <div className="flex justify-center">
                                       {question.chatgpt ? (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg overflow-hidden">
                                           <Image 
                                             src={question.chatgpt as string} 
                                             alt="ChatGPT Result" 
                                             width={48}
                                             height={48}
                                             className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                             onClick={() => {
                                               const params = new URLSearchParams({
                                                 url: encodeURIComponent(question.chatgpt as string),
                                                 title: 'ChatGPT 结果图片',
                                                 model: 'ChatGPT',
                                                 question: (question.q_name as string) || `题目 ${question.q_id as string}`
                                               });
                                               window.open(`/image?${params.toString()}`, '_blank');
                                             }}
                                             onError={(e) => {
                                               (e.target as HTMLImageElement).src = "https://via.placeholder.com/48x48/e5e7eb/6b7280?text=ChatGPT";
                                             }}
                                             unoptimized
                                           />
                                         </div>
                                       ) : (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                           <span className="text-xs text-gray-500">暂无</span>
                                         </div>
                                       )}
                                     </div>
                                   </td>
                                   <td className="px-2 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm border-b border-gray-100">
                                     <div className="flex justify-center">
                                       {question.manus ? (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg overflow-hidden">
                                           <Image 
                                             src={question.manus as string} 
                                             alt="Manus Result" 
                                             width={48}
                                             height={48}
                                             className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                             onClick={() => {
                                               const params = new URLSearchParams({
                                                 url: encodeURIComponent(question.manus as string),
                                                 title: 'Manus 结果图片',
                                                 model: 'Manus',
                                                 question: (question.q_name as string) || `题目 ${question.q_id as string}`
                                               });
                                               window.open(`/image?${params.toString()}`, '_blank');
                                             }}
                                             onError={(e) => {
                                               (e.target as HTMLImageElement).src = "https://via.placeholder.com/48x48/e5e7eb/6b7280?text=Manus";
                                             }}
                                             unoptimized
                                           />
                                         </div>
                                       ) : (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                           <span className="text-xs text-gray-500">暂无</span>
                                         </div>
                                       )}
                                     </div>
                                   </td>
                                   <td className="px-2 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm border-b border-gray-100">
                                     <div className="flex justify-center">
                                       {question.navos ? (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg overflow-hidden">
                                           <Image 
                                             src={question.navos as string} 
                                             alt="Navos Result" 
                                             width={48}
                                             height={48}
                                             className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                             onClick={() => {
                                               const params = new URLSearchParams({
                                                 url: encodeURIComponent(question.navos as string),
                                                 title: 'Navos 结果图片',
                                                 model: 'Navos',
                                                 question: (question.q_name as string) || `题目 ${question.q_id as string}`
                                               });
                                               window.open(`/image?${params.toString()}`, '_blank');
                                             }}
                                             onError={(e) => {
                                               (e.target as HTMLImageElement).src = "https://via.placeholder.com/48x48/e5e7eb/6b7280?text=Navos";
                                             }}
                                             unoptimized
                                           />
                                         </div>
                                       ) : (
                                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                           <span className="text-xs text-gray-500">暂无</span>
                                         </div>
                                       )}
                                     </div>
                                   </td>
                                 </tr>
                               )) : null}
                             </tbody>
                           </table>
                         </div>
                       )}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">确认删除</h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                确定要删除这个题集吗？此操作无法撤销，题集中的所有题目也将被删除。
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button
                onClick={() => deleteQuestionSet(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuestionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    }>
      <QuestionPageContent />
    </Suspense>
  );
}