'use client';

import React, { useState } from 'react';
import { Answer } from '@/types/evaluation';

interface ImageViewerProps {
  answer: Answer;
  onClick?: () => void;
}

export function ImageViewer({ answer, onClick }: ImageViewerProps) {
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
    <div className="flex flex-col">
      {/* 图片容器 */}
      <div 
        className="relative group cursor-pointer bg-blue-50 rounded-lg overflow-hidden border border-blue-100 hover:border-blue-300 transition-all duration-200 hover:shadow-sm mb-2"
        onClick={onClick}
      >
        <div className="aspect-[4/3] relative">
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
            <img
              src={answer.imageUrl}
              alt={answer.title}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {/* 放大图标 */}
          <div className="absolute top-3 right-3 bg-blue-500/80 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
          
          {/* 角标装饰 */}
          <div className="absolute top-0 left-0 w-0 h-0 border-l-[20px] border-l-blue-200 border-b-[20px] border-b-transparent opacity-60"></div>
        </div>
      </div>
      
      {/* 标题移到下方 */}
      <div className="text-center">
        <h3 className="font-bold text-gray-800 text-lg mb-1">{answer.title}</h3>
        {answer.description && (
          <p className="text-sm text-gray-600">{answer.description}</p>
        )}
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
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-none w-auto animate-scaleIn">
        {/* 图片 */}
        <div className="relative bg-white rounded-2xl shadow-elegant overflow-hidden">
          <img
            src={answer.imageUrl}
            alt={answer.title}
            className="w-auto h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}