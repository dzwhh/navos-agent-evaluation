'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { EvaluationQuestion as Question, QuestionRating, Score, SCORE_DIMENSIONS } from '@/types/evaluation';
import { EvaluationData } from '@/lib/database';
import { saveEvaluationToDatabase } from '@/lib/evaluation-api';
import { getQuestionsBySetId, getUserEvaluationsByTopicId } from '@/lib/database';
import { userTopicMappingAPI } from '@/lib/supabase';

// 评分维度定义已从 @/types/evaluation 导入
import { ImageViewer, ImageModal } from './ImageViewer';
import { AnswerRatingCard, RatingProgress } from './RatingSystem';
import { toast } from 'sonner';


export function EvaluationPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionRatings, setQuestionRatings] = useState<QuestionRating[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ answer: unknown; isOpen: boolean }>({ answer: null, isOpen: false });
  const [isLoadingTopic, setIsLoadingTopic] = useState(true);
  const [topicInfo, setTopicInfo] = useState<{ name: string; row_num: number; isDefault?: boolean } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<number | null>(null);
  
  // 添加状态跟踪已保存的题目，避免重复写入
  // 改为按答案级别跟踪保存状态，使用联合主键组合作为唯一标识
  const [savedAnswers, setSavedAnswers] = useState<Set<string>>(new Set());

  // 题目数据状态
  const [questions, setQuestions] = useState<Question[]>([]);

  // 保存评测结果到本地存储（与用户关联）
  const saveUserEvaluation = useCallback(() => {
    if (user) {
      const userEvaluationKey = `userEvaluation_${user.id}`;
      const userEvaluation = {
        userId: user.id,
        questionRatings,
        completedAt: new Date()
      };
      localStorage.setItem(userEvaluationKey, JSON.stringify(userEvaluation));
    }
  }, [user, questionRatings]);



  // 加载用户的评测结果
  useEffect(() => {
    const loadUserEvaluations = async () => {
      if (!user || !topicId) {
        console.log('⚠️ 用户或题集ID未准备好，跳过加载评分数据');
        return;
      }
      
      try {
        console.log('🔍 开始从数据库加载用户评分数据，用户:', user.username, '题集ID:', topicId);
        
        // 优先从数据库获取评分数据
        const dbResult = await getUserEvaluationsByTopicId(user.username, topicId);
        
        if (dbResult.success && dbResult.data && dbResult.data.length > 0) {
          console.log('✅ 从数据库获取到评分数据:', dbResult.data.length, '条记录');
          
          // 将数据库数据转换为前端questionRatings格式
          const dbQuestionRatings = convertDbDataToQuestionRatings(dbResult.data as Record<string, unknown>[]);
          setQuestionRatings(dbQuestionRatings);
          
          console.log('✅ 已设置数据库评分数据到状态中');
        } else {
          console.log('📝 数据库中暂无评分数据，尝试从本地存储加载');
          
          // 如果数据库没有数据，则从本地存储加载（作为备份）
          const userEvaluationKey = `userEvaluation_${user.id}`;
          const savedEvaluation = localStorage.getItem(userEvaluationKey);
          if (savedEvaluation) {
            try {
              const parsedEvaluation = JSON.parse(savedEvaluation);
              setQuestionRatings(parsedEvaluation.questionRatings || []);
              console.log('✅ 从本地存储加载评分数据');
            } catch (e) {
              console.error('❌ 解析本地存储评分数据失败:', e);
            }
          }
        }
      } catch (error) {
        console.error('❌ 加载用户评分数据失败:', error);
        
        // 发生错误时，尝试从本地存储加载作为备份
        const userEvaluationKey = `userEvaluation_${user.id}`;
        const savedEvaluation = localStorage.getItem(userEvaluationKey);
        if (savedEvaluation) {
          try {
            const parsedEvaluation = JSON.parse(savedEvaluation);
            setQuestionRatings(parsedEvaluation.questionRatings || []);
            console.log('✅ 从本地存储加载评分数据（备份）');
          } catch (e) {
            console.error('❌ 解析本地存储评分数据失败:', e);
          }
        }
      }
    };
    
    loadUserEvaluations();
  }, [user, topicId]); // 依赖用户和题集ID

  // 当评分发生变化时保存结果
  useEffect(() => {
    if (questionRatings.length > 0) {
      saveUserEvaluation();
    }
  }, [questionRatings, saveUserEvaluation]);

  // 根据topic_id加载题目数据
  const loadQuestionsByTopicId = async (topicId: number) => {
    try {
      setIsLoadingTopic(true);
      setLoadError(null);
      
      console.log('🔍 开始根据topic_id加载题目数据:', topicId);
      
      const result = await getQuestionsBySetId(topicId);
      
      console.log('📊 数据库查询结果:', result);
      
      if (!result.success) {
        throw new Error(result.error || '获取题目数据失败');
      }
      
      const topicQuestions = result.data || [];
      
      console.log('✅ 成功获取题目数据:', topicQuestions.length, '个题目');
      console.log('📋 题目数据详情:', topicQuestions);
      
      // 转换题目数据格式
      const formattedQuestions: Question[] = (topicQuestions as Record<string, unknown>[]).map((q: Record<string, unknown>, index: number) => {
        console.log(`🔄 处理题目 ${index + 1}:`, q);
        
        const answers = [
          { id: `${index + 1}-1`, title: "A", imageUrl: (q.minimax as string) || (q.minimaxResult as string) || '', description: "结果A", modelName: "MiniMax" },
          { id: `${index + 1}-2`, title: "B", imageUrl: (q.qwen as string) || (q.qwenResult as string) || '', description: "结果B", modelName: "Qwen" },
          { id: `${index + 1}-3`, title: "C", imageUrl: (q.deepseek as string) || (q.deepseekResult as string) || '', description: "结果C", modelName: "DeepSeek" },
          { id: `${index + 1}-4`, title: "D", imageUrl: (q.chatgpt as string) || (q.chatgptResult as string) || '', description: "结果D", modelName: "ChatGPT" },
          { id: `${index + 1}-5`, title: "E", imageUrl: (q.manus as string) || (q.manusResult as string) || '', description: "结果E", modelName: "Manus" },
          { id: `${index + 1}-6`, title: "F", imageUrl: (q.navos as string) || (q.navosResult as string) || '', description: "结果F", modelName: "Navos" }
        ].filter(answer => answer.imageUrl && answer.imageUrl.trim() !== ''); // 过滤掉空的图片URL
        
        console.log(`📸 题目 ${index + 1} 的答案数量:`, answers.length);
        
        return {
          id: (q.id as number) || (q.q_id as number) || (index + 1), // 使用数据库中的真实q_id
          title: (q.q_name as string) || (q.name as string) || `题目 ${index + 1}`,
          scenario: (q.scenario as string) || (q.agent_scene as string) || '', // 添加scenario字段映射
          answers
        };
      });
      
      console.log('🎯 最终格式化的题目数据:', formattedQuestions);
      
      setQuestions(formattedQuestions);
      
      if (formattedQuestions.length === 0) {
        setLoadError('该题集暂无题目数据');
      } else {
        // 设置题集信息
        setTopicInfo({
          name: (topicQuestions[0] as Record<string, unknown>)?.topicName as string || `题集 ${topicId}`,
          row_num: topicId,
          isDefault: false
        });
        
        toast.success(`成功加载题集`, {
          description: `共 ${formattedQuestions.length} 道题目`,
          duration: 3000
        });
      }
      
    } catch (error) {
      console.error('❌ 加载题目数据失败:', error);
      setLoadError(error instanceof Error ? error.message : '加载题目数据失败');
      toast.error('加载题目数据失败', {
        description: error instanceof Error ? error.message : '请检查网络连接或联系管理员',
        duration: 5000
      });
    } finally {
      setIsLoadingTopic(false);
    }
  };



  // 组件初始化时根据用户获取topic_id并加载数据
  useEffect(() => {
    const loadUserTopicData = async () => {
      if (!user) {
        console.log('⚠️ 用户未登录，等待用户信息');
        return;
      }
      
      try {
        console.log('🔍 开始获取用户对应的topic_id，用户ID:', user.id);
        
        // 从数据库获取用户对应的topic_id
        const userTopicId = await userTopicMappingAPI.getUserTopicId(Number(user.id));
        
        if (userTopicId) {
          console.log('✅ 获取到用户对应的topic_id:', userTopicId);
          setTopicId(userTopicId);
          loadQuestionsByTopicId(userTopicId);
        } else {
          console.error('❌ 未找到用户对应的题集映射');
          setLoadError('未找到您对应的题集，请联系管理员分配题集权限');
        }
      } catch (error) {
        console.error('❌ 获取用户题集映射失败:', error);
        setLoadError('获取题集信息失败，请稍后重试');
      }
    };
    
    loadUserTopicData();
  }, [user]); // 依赖用户信息

  // 处理登出逻辑
  const handleLogout = () => {
    console.log('开始登出流程');
    try {
      logout();
      console.log('登出成功，跳转到登录页面');
      // 使用完整的相对路径
      router.push('/login');
    } catch (error) {
      console.error('登出过程中发生错误:', error);
    }
  };

  // 检查用户是否已认证 - 暂时禁用，使用默认数据展示
  // useEffect(() => {
  //   if (!user) {
  //     router.push('/login');
  //   }
  // }, [user, router]);

  const currentQuestion = questions[currentQuestionIndex];
  
  // 添加调试日志
  console.log('🎯 当前组件状态:', {
    isLoadingTopic,
    loadError,
    questionsLength: questions.length,
    currentQuestionIndex,
    topicId,
    currentQuestion: currentQuestion ? {
      id: currentQuestion.id,
      title: currentQuestion.title,
      answersCount: currentQuestion.answers.length
    } : null
  });
  
  // 如果没有当前题目，显示加载状态
  if (!currentQuestion && !isLoadingTopic && !loadError) {
    console.log('⚠️ 没有当前题目，但不在加载状态');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">准备题目数据...</h2>
          <p className="text-gray-600">正在处理题目信息</p>
        </div>
      </div>
    );
  }

  // 获取当前题目的评分
  const getCurrentQuestionRating = (): QuestionRating => {
    const existing = questionRatings.find(qr => qr.questionId === currentQuestion.id);
    if (existing) return existing;

    // 创建新的评分记录
    const newRating: QuestionRating = {
      questionId: currentQuestion.id,
      answerRatings: currentQuestion.answers.map(answer => ({
        answerId: answer.id,
        scores: [],
        totalScore: 0
      }))
    };
    return newRating;
  };

  // 单题完成后立即写入数据库
  const saveCurrentQuestionToDatabase = async (questionId: string) => {
    // 生成答案保存状态的唯一标识函数
    const getAnswerSaveKey = (qId: string, title: string, userName: string) => {
      return `${qId}-${title}-${userName}`;
    };
    
    try {
      
      const questionRating = questionRatings.find(qr => qr.questionId === Number(questionId));
      const question = questions.find(q => q.id === Number(questionId));
      
      if (!questionRating || !question || !user || !user.username || !topicId) {
        console.warn('缺少必要数据，跳过单题保存:', { 
          questionRating: !!questionRating, 
          question: !!question, 
          user: !!user, 
          username: user?.username,
          topicId 
        });
        return;
      }

      console.log('🔄 开始保存单题评分到数据库:', questionId);
      
      // 为每个答案创建评测数据
      const savePromises = questionRating.answerRatings.map(async (answerRating) => {
        const answer = question.answers.find(a => a.id === answerRating.answerId);
        if (!answer) return null;

        // 移除重复检查，总是尝试保存，让数据库upsert机制处理更新
        const answerSaveKey = getAnswerSaveKey(questionId, answer.title, user.username);
        console.log('🔄 准备保存答案评分:', { answerTitle: answer.title, answerSaveKey });

        const scores = {
          item_visual: answerRating.scores.find(s => s.dimension === 'intuitive')?.value || 0,
          item_major: answerRating.scores.find(s => s.dimension === 'professional')?.value || 0,
          item_data: answerRating.scores.find(s => s.dimension === 'data_sufficiency')?.value || 0,
          item_guide: answerRating.scores.find(s => s.dimension === 'guidance')?.value || 0
        };
        
        // 直接使用题目的scenario字段
        const agentScene = question.scenario || '';
        
        const evaluationData: EvaluationData = {
          qId: parseInt(questionId) || 1, // 确保qId是数字类型
          qName: question.title,
          title: answer.title,
          agentType: answer.description || '',
          itemVisual: scores.item_visual,
          itemMajor: scores.item_major,
          itemData: scores.item_data,
          itemGuide: scores.item_guide,
          agentName: answer.modelName || answer.title || '',
          agentScene: agentScene,  // 通过q_id从navos_question_data表查询获取
          topicId: topicId,
          userName: user.username
        };
        
        console.log('🔍 准备保存的评测数据:', {
          questionId,
          answerTitle: answer.title,
          userName: user.username,
          qId: parseInt(questionId) || 1,
          scores
        });

        return saveEvaluationToDatabase(evaluationData).then(result => {
          // 保存成功后记录该答案已保存
          if (result.success) {
            setSavedAnswers(prev => new Set(prev).add(answerSaveKey));
          }
          return result;
        });
      });

      const results = await Promise.all(savePromises.filter(p => p !== null));
      const successfulResults = results.filter(result => result?.success);
      const failedResults = results.filter(result => !result?.success);
      
      const totalAnswers = results.length;
      const successfulCount = successfulResults.length;
      const failedCount = failedResults.length;
      
      if (failedCount === 0) {
        // 全部成功
        console.log('✅ 单题评分保存成功:', questionId, `成功: ${successfulCount}`);
        toast.success('题目评分已保存', {
          description: `题目 ${questionId} 的评分已成功保存到数据库`,
          duration: 2000
        });
      } else if (successfulCount > 0) {
        // 部分成功
        console.warn('⚠️ 单题评分部分保存成功:', questionId, `成功: ${successfulCount}, 失败: ${failedCount}`);
        toast.warning('题目评分部分保存', {
          description: `题目 ${questionId} 的评分部分保存成功 (${successfulCount}/${totalAnswers})`,
          duration: 3000
        });
      } else {
        // 全部失败
        console.error('❌ 单题评分保存失败:', questionId, `失败: ${failedCount}`);
        toast.error('题目评分保存失败', {
          description: `题目 ${questionId} 的评分保存失败，请稍后重试`,
          duration: 4000
        });
      }
    } catch (error) {
      console.error('❌ 单题评分保存失败:', error);
      toast.error('评分保存失败', {
        description: '数据已保存到本地备份，请稍后重试',
        duration: 3000
      });
    }
  };

  // 更新评分
  const updateScore = (answerId: string, dimension: string, value: number) => {
    console.log('🔄 updateScore 被调用:', { answerId, dimension, value, questionId: currentQuestion.id });
    
    setQuestionRatings(prev => {
      const questionRating = getCurrentQuestionRating();
      const answerRating = questionRating.answerRatings.find(ar => ar.answerId === answerId);
      
      if (!answerRating) {
        console.warn('⚠️ 未找到对应的答案评分:', answerId);
        return prev;
      }

      // 更新或添加评分
      const existingScoreIndex = answerRating.scores.findIndex(s => s.dimension === dimension);
      const oldValue = existingScoreIndex >= 0 ? answerRating.scores[existingScoreIndex].value : undefined;
      
      if (existingScoreIndex >= 0) {
        answerRating.scores[existingScoreIndex].value = value;
        console.log('📝 更新现有评分:', { dimension, oldValue, newValue: value });
      } else {
        answerRating.scores.push({ dimension, value });
        console.log('➕ 添加新评分:', { dimension, value });
      }

      // 重新计算总分
      answerRating.totalScore = answerRating.scores.reduce((sum, score) => sum + score.value, 0);

      // 更新或添加到questionRatings中
      const existingQuestionIndex = prev.findIndex(qr => qr.questionId === currentQuestion.id);
      let updatedRatings;
      if (existingQuestionIndex >= 0) {
        updatedRatings = [...prev];
        updatedRatings[existingQuestionIndex] = questionRating;
      } else {
        updatedRatings = [...prev, questionRating];
      }

      // 检查当前题目是否完成，如果完成且有未保存的答案则立即保存到数据库
      const isCompleted = questionRating.answerRatings.every(ar => 
        ar.scores.length === SCORE_DIMENSIONS.length && 
        ar.scores.every(score => score.value > 0)
      );
      
      console.log('🔍 检查题目完成状态:', { 
        questionId: currentQuestion.id, 
        isCompleted, 
        answerRatingsCount: questionRating.answerRatings.length,
        scoreDimensionsLength: SCORE_DIMENSIONS.length
      });
      
      if (isCompleted) {
        // 当题目完成时，总是尝试保存（因为可能是修改了已有评分）
        // 移除savedAnswers的检查，让数据库的upsert机制处理重复保存
        console.log('✅ 题目已完成，准备保存到数据库（支持更新已有评分）');
        console.log('⏰ 准备自动保存到数据库，延迟100ms...');
        
        // 使用setTimeout确保状态更新完成后再保存
        setTimeout(() => {
          console.log('🚀 开始执行自动保存到数据库');
          saveCurrentQuestionToDatabase(String(currentQuestion.id));
        }, 100);
      } else {
        console.log('⏳ 题目尚未完成，不触发自动保存');
      }

      return updatedRatings;
    });
  };

  // 获取答案的评分
  const getAnswerScores = (answerId: string): Score[] => {
    const questionRating = questionRatings.find(qr => qr.questionId === currentQuestion.id);
    if (!questionRating) return [];
    
    const answerRating = questionRating.answerRatings.find(ar => ar.answerId === answerId);
    return answerRating ? answerRating.scores : [];
  };

  // 检查当前题目是否完成评分
  const isCurrentQuestionComplete = (): boolean => {
    const questionRating = questionRatings.find(qr => qr.questionId === currentQuestion.id);
    if (!questionRating) return false;

    return questionRating.answerRatings.every(ar => 
      ar.scores.length === SCORE_DIMENSIONS.length && 
      ar.scores.every(score => score.value > 0)
    );
  };

  // 计算总体进度
  const getTotalProgress = () => {
    const completedQuestions = questionRatings.filter(qr => {
      return qr.answerRatings.every(ar => 
        ar.scores.length === SCORE_DIMENSIONS.length && 
        ar.scores.every(score => score.value > 0)
      );
    }).length;
    
    return {
      completed: completedQuestions,
      total: questions.length
    };
  };

  // 将数据库评分数据转换为前端questionRatings格式
  const convertDbDataToQuestionRatings = (dbData: Record<string, unknown>[]): QuestionRating[] => {
    const questionRatingsMap = new Map<string, QuestionRating>();
    
    dbData.forEach(record => {
      const questionId = record.question_id as string;
      
      if (!questionRatingsMap.has(questionId)) {
        questionRatingsMap.set(questionId, {
          questionId: Number(questionId),
          answerRatings: []
        });
      }
      
      const questionRating = questionRatingsMap.get(questionId)!;
      
      // 查找或创建对应的答案评分
      let answerRating = questionRating.answerRatings.find(ar => ar.answerId === record.answer_id as string);
      if (!answerRating) {
        answerRating = {
          answerId: record.answer_id as string,
          scores: [],
          totalScore: 0
        };
        questionRating.answerRatings.push(answerRating);
      }
      
      // 根据数据库字段映射到前端维度
      let dimension: string;
      let value: number;
      
      if (record.item_visual !== undefined) {
        dimension = 'intuitive';
        value = record.item_visual as number;
      } else if (record.item_major !== undefined) {
        dimension = 'professional';
        value = record.item_major as number;
      } else if (record.item_data !== undefined) {
        dimension = 'data_sufficiency';
        value = record.item_data as number;
      } else if (record.item_guide !== undefined) {
        dimension = 'guidance';
        value = record.item_guide as number;
      } else {
        return; // 跳过无效记录
      }
      
      // 检查是否已存在该维度的评分
      const existingScoreIndex = answerRating.scores.findIndex(s => s.dimension === dimension);
      if (existingScoreIndex >= 0) {
        answerRating.scores[existingScoreIndex].value = value;
      } else {
        answerRating.scores.push({
          dimension,
          value
        });
      }
    });
    
    // 计算每个答案的总分
    questionRatingsMap.forEach(questionRating => {
      questionRating.answerRatings.forEach(answerRating => {
        answerRating.totalScore = answerRating.scores.reduce((sum, score) => sum + score.value, 0);
      });
    });
    
    return Array.from(questionRatingsMap.values());
  };

  // 导航到下一题
  const goToNextQuestion = () => {
    // 检查当前题目是否完成评分
    if (!isCurrentQuestionComplete()) {
      alert('请完成当前题目的所有答案评分后再进入下一题！');
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // 导航到上一题
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // 清空所有评分
  const clearAllRatings = () => {
    // 显示确认对话框
    const confirmed = window.confirm(
      '确定要清空所有题目的评分吗？\n\n此操作将删除所有已保存的评分数据，且无法恢复。'
    );
    
    if (confirmed) {
      try {
        // 重置questionRatings状态为空数组
        setQuestionRatings([]);
        
        // 清除本地存储中的评分数据
        if (user) {
          const userEvaluationKey = `userEvaluation_${user.id}`;
          localStorage.removeItem(userEvaluationKey);
        }
        
        // 显示成功提示
        toast.success('已清空所有评分', {
          description: '所有题目的评分数据已被清除',
          duration: 3000
        });
        
        console.log('✅ 已清空所有评分数据');
      } catch (error) {
        console.error('❌ 清空评分时发生错误:', error);
        toast.error('清空评分失败', {
          description: '请稍后重试或联系管理员',
          duration: 5000
        });
      }
    }
  };

  // 提交评测
  const submitEvaluation = async () => {
    const totalProgress = getTotalProgress();
    if (totalProgress.completed === totalProgress.total) {
      // 保存到本地存储（备份）
      saveUserEvaluation();
      
      // 显示完成提示
      alert(`评测已完成并成功保存到数据库！感谢您的参与，${user?.username}。`);
      console.log('评测结果已保存到本地:', questionRatings);
    } else {
      alert(`还有 ${totalProgress.total - totalProgress.completed} 道题未完成，请继续评分。`);
    }
  };

  const totalProgress = getTotalProgress();

  // 如果用户未认证，显示加载状态
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">正在验证用户身份...</p>
        </div>
      </div>
    );
  }

  // 加载状态页面
  if (isLoadingTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">正在加载题集...</h2>
          <p className="text-gray-600">为您获取最新的题目数据</p>
        </div>
      </div>
    );
  }

  // 错误状态页面
  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">加载失败</h2>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (topicId) {
                  loadQuestionsByTopicId(topicId);
                }
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 font-semibold"
            >
              重试加载
            </button>
            <button
              onClick={() => router.push('/home')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 无题目数据状态
  if (!isLoadingTopic && !loadError && questions.length === 0) {
    console.log('⚠️ 显示无题目数据状态');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">暂无题目</h2>
          <p className="text-gray-600 mb-6">该题集暂无可用的题目数据，请检查题集内容或联系管理员。</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (topicId) {
                  loadQuestionsByTopicId(topicId);
                }
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 font-semibold"
            >
              重新加载
            </button>
            <button
              onClick={() => router.push('/question')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold"
            >
              前往题目管理
            </button>
            <button
              onClick={() => router.push('/home')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
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
      {/* 顶部导航栏 */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* 回退按钮 */}
              <button
                onClick={() => router.push('/home')}
                className="mr-4 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-blue-100 hover:bg-white/80 transition-all duration-200 flex items-center space-x-2 text-blue-700 hover:text-blue-800"
                title="返回首页"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">返回首页</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-blue-800 mb-2">🤖 AI Agent 评测系统</h1>
                <p className="text-blue-600">盲测评估 - 请根据答案质量进行客观评分</p>

              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 mb-2 border border-blue-100">
                  <div className="text-xl font-bold text-blue-700 whitespace-nowrap">
                    题目 {currentQuestionIndex + 1} / {questions.length}
                  </div>
                  <div className="text-sm text-blue-500 whitespace-nowrap">
                    总进度: {totalProgress.completed} / {totalProgress.total}
                  </div>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(totalProgress.completed / totalProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* 用户信息和操作按钮 */}
              <div className="flex items-center space-x-3">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-blue-100">
                  <div className="text-sm text-blue-700 font-medium">{user?.username}</div>
                  <div className="text-xs text-blue-500">用户</div>
                </div>
                
                {/* 清空评分按钮 */}
                <button
                  onClick={clearAllRatings}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold shadow-sm flex items-center space-x-2"
                  title="清空所有评分"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">清空评分</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-sm"
                  title="登出"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* 主内容区域：题目、答案和评分 */}
          <div className="lg:col-span-5 animate-fadeInUp">
            {/* 题目 */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8 mb-8 relative overflow-hidden animate-scaleIn">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-200 to-cyan-200"></div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-blue-300 to-cyan-300 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                      {currentQuestion.id}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      题目 {currentQuestion.id}
                    </h2>
                    {currentQuestion.scenario && (
                      <span className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium ml-3 border border-orange-200">
                        {currentQuestion.scenario}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {currentQuestion.title}
                  </p>
                </div>
                <div className="ml-6">
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                    isCurrentQuestionComplete() 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                      : 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border border-amber-200'
                  }`}>
                    {isCurrentQuestionComplete() ? '✓ 已完成' : '⏳ 进行中'}
                  </div>
                </div>
              </div>
            </div>

            {/* 答案图片展示 */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8 mb-8 animate-fadeInUp">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">📋 结果选项</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {currentQuestion.answers.map((answer, index) => (
                  <div key={answer.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <ImageViewer
                      answer={answer}
                      onClick={() => setSelectedImage({ answer, isOpen: true })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 答案评分卡片 - 水平一排 */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">⭐ 结果评分</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {currentQuestion.answers.map((answer, index) => (
                  <div key={answer.id} className="animate-fadeInUp" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                    <AnswerRatingCard
                      answerId={answer.id}
                      answerTitle={answer.title}
                      dimensions={SCORE_DIMENSIONS}
                      scores={getAnswerScores(answer.id)}
                      onScoreChange={(dimension, value) => updateScore(answer.id, dimension, value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：进度和导航区域 */}
          <div className="lg:col-span-1 space-y-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            {/* 进度信息 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm p-6 border border-blue-100">
              <h3 className="font-bold text-gray-800 mb-4">📈 评分进度</h3>
              <RatingProgress 
                totalAnswers={currentQuestion.answers.length} 
                ratedAnswers={getCurrentQuestionRating().answerRatings.filter(ar => 
                  ar.scores.length === SCORE_DIMENSIONS.length && 
                  ar.scores.every(score => score.value > 0)
                ).length}
              />
            </div>

            {/* 导航按钮 */}
            <div className="bg-white rounded-xl shadow-elegant border-0 p-6 animate-scaleIn">
              <div className="flex flex-col gap-4">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-soft transform hover:scale-105"
                >
                  ← 上一题
                </button>
                
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={goToNextQuestion}
                    disabled={!isCurrentQuestionComplete()}
                    className={`w-full px-6 py-3 rounded-lg transition-all duration-200 font-semibold shadow-elegant transform hover:scale-105 ${
                      isCurrentQuestionComplete()
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={!isCurrentQuestionComplete() ? '请完成当前题目的所有答案评分' : ''}
                  >
                    {isCurrentQuestionComplete() ? '下一题 →' : '请完成评分'}
                  </button>
                ) : (
                  <button
                    onClick={submitEvaluation}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-elegant transform hover:scale-105"
                  >
                    ✓ 提交评测
                  </button>
                )}
              </div>

              {/* 题目跳转 */}
              <div className="mt-6 border-t pt-6">
                <div className="flex items-center mb-3">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1 mr-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">⚡ 快速跳转</h4>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {questions.map((_, index) => {
                    const isCompleted = questionRatings.find(qr => qr.questionId === questions[index].id)?.answerRatings.every(ar => 
                      ar.scores.length === SCORE_DIMENSIONS.length && 
                      ar.scores.every(score => score.value > 0)
                    );
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-8 h-8 text-xs rounded-lg transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center relative ${
                          index === currentQuestionIndex
                            ? 'bg-gradient-to-r from-blue-300 to-cyan-300 text-white shadow-sm'
                            : isCompleted
                            ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300 border border-red-200'
                            : 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 hover:from-blue-100 hover:to-cyan-100 border border-blue-100'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 图片预览模态框 */}
      <ImageModal
        answer={selectedImage.answer as any}
        isOpen={selectedImage.isOpen}
        onClose={() => setSelectedImage({ answer: null, isOpen: false })}
      />
    </div>
  );
}