import React from 'react';

export default function HomePage() {
  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            맛집을 발견하세요
          </h1>
          <p className="text-gray-600">
            가까운 맛집을 찾고 리뷰를 남겨보세요
          </p>
        </div>

        {/* Placeholder content */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">인기 맛집</h3>
            <p className="text-sm text-gray-600">
              주변 인기 맛집들을 확인해보세요
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">최근 리뷰</h3>
            <p className="text-sm text-gray-600">
              다른 사용자들의 최신 리뷰를 확인하세요
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">추천 맛집</h3>
            <p className="text-sm text-gray-600">
              당신을 위한 맞춤 맛집 추천
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}