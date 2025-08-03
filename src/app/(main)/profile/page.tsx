import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-gray-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            사용자님
          </h1>
          <p className="text-gray-600 text-sm">
            user@example.com
          </p>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">리뷰</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">위시리스트</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">팔로워</div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <button className="w-full flex items-center px-4 py-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Settings className="h-5 w-5 text-gray-600 mr-3" />
            <span className="text-gray-900">설정</span>
          </button>
          
          <button className="w-full flex items-center px-4 py-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-red-600">
            <LogOut className="h-5 w-5 mr-3" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );
}