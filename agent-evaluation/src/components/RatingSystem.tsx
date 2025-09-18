'use client';

import React from 'react';
import { Score, ScoreDimension } from '@/types/evaluation';

interface RatingStarsProps {
  value: number;
  onChange: (value: number) => void;
  dimension: string;
}

function RatingStars({ value, onChange, dimension }: RatingStarsProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={`w-6 h-6 transition-all duration-200 transform hover:scale-110 ${
            rating <= value
              ? 'text-yellow-400 hover:text-yellow-500 drop-shadow-md'
              : 'text-gray-300 hover:text-yellow-300'
          }`}
        >
          <svg
            className="w-full h-full filter drop-shadow-sm"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

interface AnswerRatingCardProps {
  answerId: string;
  answerTitle: string;
  dimensions: ScoreDimension[];
  scores: Score[];
  onScoreChange: (dimension: string, value: number) => void;
}

export function AnswerRatingCard({
  answerId,
  answerTitle,
  dimensions,
  scores,
  onScoreChange,
}: AnswerRatingCardProps) {
  const getScoreForDimension = (dimension: string): number => {
    const score = scores.find((s) => s.dimension === dimension);
    return score ? score.value : 0;
  };

  const totalScore = scores.reduce((sum, score) => sum + score.value, 0);
  const averageScore = scores.length > 0 ? (totalScore / scores.length).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-4 transform transition-all duration-300 hover:shadow-md">
      {/* 答案标题和总分 - 粉密布局 */}
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center mb-2">
          <div className="bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs mr-2">
            {answerTitle.slice(-1)}
          </div>
          <h4 className="font-bold text-lg text-gray-800">{answerTitle}</h4>
        </div>
        <div className="bg-gradient-to-r from-blue-300 to-cyan-300 text-white rounded-lg px-3 py-1 shadow-sm">
          <div className="text-lg font-bold">{averageScore}</div>
        </div>
      </div>

      {/* 各维度评分 - 紧寁布局 */}
      <div className="space-y-3">
        {dimensions.map((dimension, index) => (
          <div key={dimension.key} className="relative">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  index === 0 ? 'bg-blue-400' :
                  index === 1 ? 'bg-green-400' :
                  index === 2 ? 'bg-amber-400' : 'bg-purple-400'
                }`}></div>
                <h5 className="font-semibold text-sm text-gray-800">{dimension.name}</h5>
              </div>
              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                getScoreForDimension(dimension.key) >= 4 ? 'bg-green-100 text-green-800' :
                getScoreForDimension(dimension.key) >= 3 ? 'bg-amber-100 text-amber-800' :
                getScoreForDimension(dimension.key) >= 1 ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {getScoreForDimension(dimension.key) || '-'}分
              </div>
            </div>
            <div className="flex justify-center">
              <RatingStars
                value={getScoreForDimension(dimension.key)}
                onChange={(value) => onScoreChange(dimension.key, value)}
                dimension={dimension.key}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RatingProgressProps {
  totalAnswers: number;
  ratedAnswers: number;
}

export function RatingProgress({ totalAnswers, ratedAnswers }: RatingProgressProps) {
  const percentage = totalAnswers > 0 ? (ratedAnswers / totalAnswers) * 100 : 0;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-gray-700">
          已评分答案
        </span>
        <span className="text-sm font-bold text-blue-600">
          {ratedAnswers} / {totalAnswers}
        </span>
      </div>
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${percentage}%` }}
          >
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      {percentage === 100 && (
        <div className="flex items-center justify-center text-green-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-semibold">本题已完成！</span>
        </div>
      )}
    </div>
  );
}