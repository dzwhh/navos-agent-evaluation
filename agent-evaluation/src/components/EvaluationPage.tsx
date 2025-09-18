'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EvaluationQuestion, QuestionRating, AnswerRating, Score, SCORE_DIMENSIONS, generateMockData } from '@/types/evaluation';
import { ImageViewer, ImageModal } from './ImageViewer';
import { AnswerRatingCard, RatingProgress } from './RatingSystem';
import { useAuth } from '@/lib/auth-context';
import { saveEvaluationToDatabase, type EvaluationData } from '@/lib/database';

export function EvaluationPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [questions] = useState<EvaluationQuestion[]>(generateMockData());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionRatings, setQuestionRatings] = useState<QuestionRating[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ answer: any; isOpen: boolean }>({
    answer: null,
    isOpen: false
  });

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

  // 检查用户是否已认证
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const currentQuestion = questions[currentQuestionIndex];

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

  // 更新评分
  const updateScore = (answerId: string, dimension: string, value: number) => {
    setQuestionRatings(prev => {
      const questionRating = getCurrentQuestionRating();
      const answerRating = questionRating.answerRatings.find(ar => ar.answerId === answerId);
      
      if (!answerRating) return prev;

      // 更新或添加评分
      const existingScoreIndex = answerRating.scores.findIndex(s => s.dimension === dimension);
      if (existingScoreIndex >= 0) {
        answerRating.scores[existingScoreIndex].value = value;
      } else {
        answerRating.scores.push({ dimension, value });
      }

      // 重新计算总分
      answerRating.totalScore = answerRating.scores.reduce((sum, score) => sum + score.value, 0);

      // 更新或添加到questionRatings中
      const existingQuestionIndex = prev.findIndex(qr => qr.questionId === currentQuestion.id);
      if (existingQuestionIndex >= 0) {
        const updated = [...prev];
        updated[existingQuestionIndex] = questionRating;
        return updated;
      } else {
        return [...prev, questionRating];
      }
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

  // 保存评测结果到本地存储（与用户关联）
  const saveUserEvaluation = () => {
    if (user) {
      const userEvaluationKey = `userEvaluation_${user.id}`;
      const userEvaluation = {
        userId: user.id,
        questionRatings,
        completedAt: new Date()
      };
      localStorage.setItem(userEvaluationKey, JSON.stringify(userEvaluation));
    }
  };

  // 加载用户的评测结果
  useEffect(() => {
    if (user) {
      const userEvaluationKey = `userEvaluation_${user.id}`;
      const savedEvaluation = localStorage.getItem(userEvaluationKey);
      if (savedEvaluation) {
        try {
          const parsedEvaluation = JSON.parse(savedEvaluation);
          setQuestionRatings(parsedEvaluation.questionRatings || []);
        } catch (e) {
          console.error('Failed to parse user evaluation', e);
        }
      }
    }
  }, [user]);

  // 当评分发生变化时保存结果
  useEffect(() => {
    if (questionRatings.length > 0) {
      saveUserEvaluation();
    }
  }, [questionRatings]);

  // 导航到下一题
  const goToNextQuestion = () => {
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

  // 提交评测
  const submitEvaluation = async () => {
    const totalProgress = getTotalProgress();
    if (totalProgress.completed === totalProgress.total) {
      try {
        // 保存到本地存储（备份）
        saveUserEvaluation();
        
        // 准备数据库写入数据
        const evaluationPromises = questionRatings.map(async (questionRating) => {
          const question = questions.find(q => q.id === questionRating.questionId);
          if (!question) return;
          
          // 获取题目在questions数组中的索引，用于自动分配q_id (1-20)
          const questionIndex = questions.findIndex(q => q.id === questionRating.questionId);
          
          // 为每个答案的评分创建数据库记录
          const answerPromises = questionRating.answerRatings.map(async (answerRating) => {
            const answer = question.answers.find(a => a.id === answerRating.answerId);
            if (!answer || answerRating.scores.length === 0) return;
            
            // 将评分转换为数据库格式
            const scores = {
              item_visual: answerRating.scores.find(s => s.dimension === 'intuitive')?.value || 0,
              item_major: answerRating.scores.find(s => s.dimension === 'professional')?.value || 0,
              item_data: answerRating.scores.find(s => s.dimension === 'data_sufficiency')?.value || 0,
              item_guide: answerRating.scores.find(s => s.dimension === 'guidance')?.value || 0
            };
            
            const evaluationData: EvaluationData = {
              qName: question.title,
              title: answer.title,
              agentType: answer.description || '',
              itemVisual: scores.item_visual,
              itemMajor: scores.item_major,
              itemData: scores.item_data,
              itemGuide: scores.item_guide,
              questionIndex: questionIndex  // 传递题目索引，用于自动分配q_id (1-20)
            };
            
            return saveEvaluationToDatabase(evaluationData);
          });
          
          return Promise.all(answerPromises);
        });
        
        // 等待所有数据库写入完成
        const results = await Promise.all(evaluationPromises);
        const allSuccessful = results.every(resultGroup => 
          resultGroup?.every(result => result?.success)
        );
        
        if (allSuccessful) {
          alert(`评测已完成并成功保存到数据库！感谢您的参与，${user?.username}。`);
          console.log('评测结果已保存到数据库:', questionRatings);
        } else {
          alert(`评测已完成，但部分数据保存到数据库时出现问题。数据已保存到本地作为备份。感谢您的参与，${user?.username}。`);
          console.warn('部分数据库写入失败，但本地备份已保存');
        }
      } catch (error) {
        console.error('提交评测时发生错误:', error);
        alert(`评测已完成，但保存到数据库时出现错误。数据已保存到本地作为备份。感谢您的参与，${user?.username}。`);
      }
    } else {
      alert(`还有 ${totalProgress.total - totalProgress.completed} 道题未完成，请继续评分。`);
    }
  };

  const totalProgress = getTotalProgress();

  // 如果用户未认证，显示加载状态
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">正在验证用户身份...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-blue-800 mb-2">🤖 AI Agent 评测系统</h1>
              <p className="text-blue-600">盲测评估 - 请根据答案质量进行客观评分</p>
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
              
              {/* 用户信息和登出按钮 */}
              <div className="flex items-center space-x-3">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-blue-100">
                  <div className="text-sm text-blue-700 font-medium">{user?.username}</div>
                  <div className="text-xs text-blue-500">用户</div>
                </div>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
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
                <h3 className="text-xl font-bold text-gray-800">📋 答案选项</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
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
                <h3 className="text-xl font-bold text-gray-800">⭐ 答案评分</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
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
                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-elegant transform hover:scale-105"
                  >
                    下一题 →
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
                  {questions.slice(0, 20).map((_, index) => {
                    const isCompleted = questionRatings.find(qr => qr.questionId === index + 1)?.answerRatings.every(ar => 
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
        answer={selectedImage.answer}
        isOpen={selectedImage.isOpen}
        onClose={() => setSelectedImage({ answer: null, isOpen: false })}
      />
    </div>
  );
}