'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { WishlistCard } from './WishlistCard';
import { WishlistForm } from './WishlistForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Wishlist } from '@/types';

// Local interface that matches React Hook Form output
interface WishlistFormData {
  restaurantName: string;
  address?: string | undefined;
  memo?: string | undefined;
}

/**
 * Demo component to showcase WishlistCard and WishlistForm functionality
 * This demonstrates the components' features and user experience
 */
export function WishlistDemo() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([
    {
      id: '1',
      restaurantName: '스시 오마카세',
      address: '서울시 강남구 신사동 123-45',
      memo: '미슐랭 1스타 레스토랑. 런치 오마카세 예약하고 싶음. 가격은 조금 비싸지만 특별한 날에 가보고 싶다.',
      userId: 'demo-user',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-15T10:30:00Z'),
    },
    {
      id: '2',
      restaurantName: '피자 나폴리',
      address: '서울시 홍대 동교동 167-8',
      memo: '친구 추천. 정통 나폴리 피자가 맛있다고 함.',
      userId: 'demo-user',
      createdAt: new Date('2024-01-10T15:45:00Z'),
      updatedAt: new Date('2024-01-10T15:45:00Z'),
    },
    {
      id: '3',
      restaurantName: '할머니 떡볶이',
      address: null,
      memo: null,
      userId: 'demo-user',
      createdAt: new Date('2024-01-08T09:20:00Z'),
      updatedAt: new Date('2024-01-08T09:20:00Z'),
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWishlist, setEditingWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Simulate API delay
   */
  const simulateDelay = (ms: number = 1000) => 
    new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Handle adding new wishlist
   */
  const handleAddWishlist = async (data: WishlistFormData) => {
    setLoading(true);
    await simulateDelay();
    
    const newWishlist: Wishlist = {
      id: `new-${Date.now()}`,
      restaurantName: data.restaurantName,
      address: data.address ?? null,
      memo: data.memo ?? null,
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setWishlists(prev => [newWishlist, ...prev]);
    setLoading(false);
    setShowAddModal(false);
  };

  /**
   * Handle editing wishlist
   */
  const handleEditWishlist = async (data: WishlistFormData) => {
    if (!editingWishlist) return;
    
    setLoading(true);
    await simulateDelay();
    
    setWishlists(prev => 
      prev.map(item => 
        item.id === editingWishlist.id 
          ? { 
              ...item, 
              restaurantName: data.restaurantName,
              address: data.address ?? null,
              memo: data.memo ?? null,
              updatedAt: new Date() 
            }
          : item
      )
    );
    
    setLoading(false);
    setEditingWishlist(null);
  };

  /**
   * Handle deleting wishlist
   */
  const handleDeleteWishlist = async (id: string) => {
    await simulateDelay(500);
    setWishlists(prev => prev.filter(item => item.id !== id));
  };

  /**
   * Handle opening edit modal
   */
  const handleEditClick = (wishlist: Wishlist) => {
    setEditingWishlist(wishlist);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            위시리스트 컴포넌트 데모
          </h1>
          <p className="text-gray-600">
            WishlistCard와 WishlistForm 컴포넌트의 기능을 확인해보세요
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          새 위시리스트 추가
        </Button>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-blue-50 rounded-lg">
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">🎯 WishlistCard 기능</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 삭제 확인 다이얼로그</li>
            <li>• 로딩 상태 표시</li>
            <li>• 반응형 디자인</li>
            <li>• 터치 친화적 인터페이스</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">📝 WishlistForm 기능</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• React Hook Form + Zod 검증</li>
            <li>• 실시간 문자 수 카운트</li>
            <li>• 자동 포커스 및 키보드 내비게이션</li>
            <li>• 사용자 가이드 및 팁</li>
          </ul>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="space-y-4">
        {wishlists.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">위시리스트가 비어있습니다</p>
            <Button onClick={() => setShowAddModal(true)}>
              첫 번째 위시리스트 추가하기
            </Button>
          </div>
        ) : (
          wishlists.map((wishlist) => (
            <WishlistCard
              key={wishlist.id}
              wishlist={wishlist}
              onEdit={handleEditClick}
              onDelete={handleDeleteWishlist}
            />
          ))
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="새 위시리스트 추가"
        size="lg"
      >
        <WishlistForm
          onSubmit={handleAddWishlist}
          onCancel={() => setShowAddModal(false)}
          loading={loading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingWishlist}
        onClose={() => setEditingWishlist(null)}
        title="위시리스트 수정"
        size="lg"
      >
        {editingWishlist && (
          <WishlistForm
            initialData={editingWishlist}
            onSubmit={handleEditWishlist}
            onCancel={() => setEditingWishlist(null)}
            loading={loading}
          />
        )}
      </Modal>
    </div>
  );
}