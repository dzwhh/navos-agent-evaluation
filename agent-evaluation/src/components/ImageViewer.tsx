'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
            <Image
              src={answer.imageUrl}
              alt={answer.title}
              fill
              className={`object-cover transition-opacity duration-200 ${
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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 animate-fadeInUp"
      onClick={handleBackdropClick}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110 group"
        aria-label="关闭图片"
      >
        <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 图片信息 */}
      <div className="absolute top-4 left-4 z-10 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
        <h3 className="font-bold text-lg">{answer.title}</h3>
        {answer.description && (
          <p className="text-sm opacity-90">{answer.description}</p>
        )}
      </div>

      {/* 滚动容器 - 支持原始尺寸图片滚动查看 */}
      <div 
        className="w-full h-full overflow-auto p-4 flex items-start justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative min-w-0 min-h-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center min-h-[200px] min-w-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
            </div>
          )}
          
          {hasError ? (
            <div className="flex flex-col items-center justify-center bg-red-500/20 backdrop-blur-sm text-white p-8 rounded-lg min-h-[200px] min-w-[300px]">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-semibold">图片加载失败</p>
              <p className="text-sm opacity-75 mt-1">请检查图片链接或网络连接</p>
            </div>
          ) : (
            <Image
              src={answer.imageUrl}
              alt={answer.title}
              width={800}
              height={600}
              className={`block transition-opacity duration-300 cursor-pointer ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onDoubleClick={handleImageDoubleClick}
              style={{
                maxWidth: 'none',
                maxHeight: 'none',
                width: 'auto',
                height: 'auto'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}