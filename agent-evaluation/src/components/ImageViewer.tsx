'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Answer } from '@/types/evaluation';

interface ImageViewerProps {
  answer: Answer;
  onClick?: () => void;
  optionLabel?: string; // 选项标识符 (A, B, C, D, E, F)
}

export function ImageViewer({ answer, onClick, optionLabel }: ImageViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 图片容器 */}
      <div 
        className="relative group cursor-pointer bg-blue-50 rounded-lg overflow-hidden border border-blue-100 hover:border-blue-300 transition-all duration-200 hover:shadow-sm flex-1 flex flex-col"
        onClick={onClick}
      >
        <div className="flex-1 relative min-h-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-500"></div>
            </div>
          )}
          
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-600">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">图片加载失败</p>
            </div>
          ) : (
            <Image
              src={answer.imageUrl}
              alt={answer.title}
              fill
              className={`object-cover transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ objectFit: 'cover' }}
            />
          )}
          
          {/* 选项标识符 - 左上角 */}
          {optionLabel && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg z-10">
              {optionLabel}
            </div>
          )}
          
          {/* 放大图标 */}
          <div className="absolute top-3 right-3 bg-blue-500/80 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// 图片放大预览的模态框组件
interface ImageModalProps {
  answer: Answer;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ answer, isOpen, onClose }: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 防止页面背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // 清理函数
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageDoubleClick = () => {
    onClose();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={handleBackdropClick}
    >
      {/* 右侧抽屉 */}
      <div 
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          width: '60vw'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 抽屉头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-gray-900">{answer.title}</h3>
            {answer.description && (
              <p className="text-sm text-gray-600 mt-1">{answer.description}</p>
            )}
          </div>
          
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="ml-4 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 p-2 rounded-full transition-all duration-200 hover:scale-110 group"
            aria-label="关闭图片"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 图片容器 - 圆角卡片 */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full bg-gray-50 rounded-2xl shadow-inner flex flex-col overflow-hidden">
            {/* 固定的加载和错误状态容器 */}
            {isLoading && (
              <div className="flex items-center justify-center flex-1">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
              </div>
            )}
            
            {hasError && !isLoading && (
              <div className="flex flex-col items-center justify-center bg-red-50 text-red-600 p-8 rounded-xl flex-1">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-semibold">图片加载失败</p>
                <p className="text-sm opacity-75 mt-1">请检查图片链接或网络连接</p>
              </div>
            )}
            
            {/* 可滚动的图片容器 - 支持双向滚动，显示原始尺寸 */}
            {!hasError && (
              <div 
                className="flex-1 overflow-auto p-4" 
                style={{ 
                  maxHeight: 'calc(100vh - 200px)',
                  minHeight: '400px'
                }}
              >
                <Image
                  src={answer.imageUrl}
                  alt={answer.title}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className={`block rounded-xl transition-opacity duration-300 cursor-pointer shadow-lg ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  onDoubleClick={handleImageDoubleClick}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxWidth: '100%'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}