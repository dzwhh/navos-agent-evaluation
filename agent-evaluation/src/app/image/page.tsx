'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

function ImageViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [imageUrl, setImageUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [modelName, setModelName] = useState('');
  const [questionName, setQuestionName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!searchParams) {
      router.back();
      return;
    }
    
    const url = searchParams.get('url');
    const title = searchParams.get('title');
    const model = searchParams.get('model');
    const question = searchParams.get('question');

    if (url) {
      setImageUrl(decodeURIComponent(url));
      setImageTitle(title || '图片预览');
      setModelName(model || '');
      setQuestionName(question || '');
    } else {
      // 如果没有URL参数，返回上一页
      router.back();
    }
  }, [searchParams, router]);

  // 添加键盘事件监听
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        router.back();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // 清理事件监听器
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const handleClose = () => {
    router.back();
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${modelName || 'image'}_${questionName || 'result'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载图片失败:', error);
    }
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">{imageTitle}</h1>
          {modelName && questionName && (
            <p className="text-sm text-gray-300">
              {modelName} - {questionName}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 缩放控制 */}
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          
          <span className="text-sm px-2">{Math.round(scale * 100)}%</span>
          
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            title="放大"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          
          {/* 旋转控制 */}
          <button
            onClick={handleRotate}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            title="旋转"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          
          {/* 重置 */}
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            title="重置"
          >
            重置
          </button>
          
          {/* 下载 */}
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            title="下载图片"
          >
            <Download className="w-5 h-5" />
          </button>
          
          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 图片展示区域 */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {isLoading && (
          <div className="flex flex-col items-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p>正在加载图片...</p>
          </div>
        )}
        
        {imageError && (
          <div className="flex flex-col items-center text-white">
            <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center mb-4">
              <X className="w-8 h-8" />
            </div>
            <p className="text-lg mb-2">图片加载失败</p>
            <p className="text-sm text-gray-300">请检查图片链接是否有效</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              重新加载
            </button>
          </div>
        )}
        
        {imageUrl && !imageError && (
          <div className="max-w-full max-h-full overflow-auto">
            <Image
              src={imageUrl}
              alt={imageTitle}
              width={800}
              height={600}
              className="max-w-none transition-transform duration-200 ease-in-out cursor-move"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              draggable={false}
              unoptimized
            />
          </div>
        )}
      </div>
      
      {/* 底部提示 */}
      <div className="p-4 bg-black bg-opacity-50 text-center text-gray-300 text-sm">
        <p>使用工具栏控制图片缩放和旋转，点击关闭按钮或按 ESC 键退出</p>
      </div>
    </div>
  );
}

export default function ImageViewPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p>正在加载...</p>
        </div>
      </div>
    }>
      <ImageViewContent />
    </Suspense>
  );
}