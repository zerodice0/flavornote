# FlavorNote PRD - Phase 1.4: 리뷰 기능 구현

## 🎯 목표
사용자가 방문한 식당에 대한 후기를 작성, 조회, 수정, 삭제할 수 있는 리뷰 CRUD 기능을 완성합니다.

## 📋 구현 범위

### ✅ 포함 기능

#### 1. 리뷰 API
- **목록 조회**: `GET /api/reviews` - 사용자별 리뷰 목록 페이지네이션
- **상세 조회**: `GET /api/reviews/[id]` - 특정 리뷰 상세 정보
- **새 리뷰 작성**: `POST /api/reviews` - 새 리뷰 등록
- **수정**: `PUT /api/reviews/[id]` - 기존 리뷰 수정
- **삭제**: `DELETE /api/reviews/[id]` - 리뷰 삭제

#### 2. 리뷰 UI 컴포넌트
- **ReviewCard**: 리뷰 카드 표시 (재방문 의사 포함)
- **ReviewForm**: 리뷰 작성/수정 폼
- **ReviewList**: 리뷰 목록 컨테이너
- **WillRevisitBadge**: 재방문 의사 배지

#### 3. 리뷰 페이지
- **리뷰 목록 페이지**: `/reviews` - 작성한 모든 리뷰 표시
- **리뷰 작성 페이지**: `/reviews/add` - 새 리뷰 작성 폼
- **리뷰 수정 페이지**: `/reviews/[id]/edit` - 기존 리뷰 수정
- **리뷰 상세 페이지**: `/reviews/[id]` - 개별 리뷰 상세 보기

#### 4. 상태 관리 및 데이터 페칭
- **useReviews 훅**: 리뷰 데이터 관리
- **React Query 통합**: 캐싱 및 실시간 동기화
- **Optimistic Updates**: 빠른 UI 반응

### ❌ 제외 기능
- 이미지 업로드
- 메뉴별 세부 리뷰
- 평점 시스템
- 댓글 기능
- 리뷰 검색 및 필터링

## 🛣️ API 구현 상세

### 1. 리뷰 목록 조회 API
```typescript
// src/app/api/reviews/route.ts
export async function GET(request: Request) {
  try {
    const user = await authMiddleware(request);
    if (!user) return;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId: user.userId },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: { userId: user.userId },
      }),
    ]);
    
    return Response.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
    
  } catch (error) {
    return Response.json(
      { success: false, error: '리뷰를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 2. 리뷰 작성 API
```typescript
// src/app/api/reviews/route.ts
export async function POST(request: Request) {
  try {
    const user = await authMiddleware(request);
    if (!user) return;
    
    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);
    
    const review = await prisma.review.create({
      data: {
        ...validatedData,
        userId: user.userId,
      },
    });
    
    return Response.json({
      success: true,
      data: review,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { 
          success: false, 
          error: '입력 데이터가 올바르지 않습니다.', 
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return Response.json(
      { success: false, error: '리뷰 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 3. 리뷰 수정/삭제 API
```typescript
// src/app/api/reviews/[id]/route.ts
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(request);
    if (!user) return;
    
    const body = await request.json();
    const validatedData = updateReviewSchema.parse(body);
    
    // 소유권 확인
    const existingReview = await prisma.review.findFirst({
      where: { id: params.id, userId: user.userId },
    });
    
    if (!existingReview) {
      return Response.json(
        { success: false, error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });
    
    return Response.json({
      success: true,
      data: review,
    });
    
  } catch (error) {
    return Response.json(
      { success: false, error: '리뷰 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(request);
    if (!user) return;
    
    // 소유권 확인 후 삭제
    const deletedReview = await prisma.review.deleteMany({
      where: { id: params.id, userId: user.userId },
    });
    
    if (deletedReview.count === 0) {
      return Response.json(
        { success: false, error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: '리뷰가 삭제되었습니다.',
    });
    
  } catch (error) {
    return Response.json(
      { success: false, error: '리뷰 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

## ⚛️ React 컴포넌트 구현

### ReviewCard 컴포넌트
```typescript
// src/components/features/review/ReviewCard.tsx
interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function ReviewCard({ review, onEdit, onDelete, showActions = true }: ReviewCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!confirm('이 리뷰를 삭제하시겠습니까?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete?.(review.id);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {review.restaurantName}
          </h3>
          {review.address && (
            <p className="text-gray-600 text-sm mb-2">
              <MapPin className="w-3 h-3 inline mr-1" />
              {review.address}
            </p>
          )}
        </div>
        
        {showActions && (
          <div className="flex gap-2 ml-4">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(review)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                loading={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* 재방문 의사 배지 */}
      <div className="mb-3">
        <WillRevisitBadge willRevisit={review.willRevisit} />
      </div>
      
      {/* 리뷰 내용 */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">
          {review.content}
        </p>
      </div>
      
      {/* 작성일 */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {format(new Date(review.createdAt), 'yyyy.MM.dd')} 방문
        </span>
        {review.updatedAt !== review.createdAt && (
          <span>
            {format(new Date(review.updatedAt), 'yyyy.MM.dd')} 수정
          </span>
        )}
      </div>
    </div>
  );
}

// WillRevisitBadge 컴포넌트
interface WillRevisitBadgeProps {
  willRevisit: boolean;
}

export function WillRevisitBadge({ willRevisit }: WillRevisitBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        willRevisit
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
      )}
    >
      {willRevisit ? (
        <>
          <ThumbsUp className="w-3 h-3 mr-1" />
          또 가고 싶어요
        </>
      ) : (
        <>
          <ThumbsDown className="w-3 h-3 mr-1" />
          다시는 안 갈래요
        </>
      )}
    </span>
  );
}
```

### ReviewForm 컴포넌트
```typescript
// src/components/features/review/ReviewForm.tsx
interface ReviewFormProps {
  initialData?: Partial<Review>;
  onSubmit: (data: CreateReviewInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function ReviewForm({ initialData, onSubmit, onCancel, loading }: ReviewFormProps) {
  const form = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      restaurantName: initialData?.restaurantName || '',
      address: initialData?.address || '',
      content: initialData?.content || '',
      willRevisit: initialData?.willRevisit ?? true,
    },
  });
  
  const handleSubmit = async (data: CreateReviewInput) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        form.reset();
      }
    } catch (error) {
      // 에러는 상위 컴포넌트에서 처리
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Input
        label="식당명"
        placeholder="방문한 식당 이름을 입력하세요"
        {...form.register('restaurantName')}
        error={form.formState.errors.restaurantName?.message}
        required
      />
      
      <Input
        label="주소"
        placeholder="식당 주소를 입력하세요 (선택)"
        {...form.register('address')}
        error={form.formState.errors.address?.message}
      />
      
      <Input
        label="리뷰"
        type="textarea"
        placeholder="식당에 대한 솔직한 후기를 작성해주세요"
        {...form.register('content')}
        error={form.formState.errors.content?.message}
        required
      />
      
      {/* 재방문 의사 선택 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          재방문 의사
        </label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="true"
              {...form.register('willRevisit', { valueAsBoolean: true })}
              className="sr-only"
            />
            <div
              className={cn(
                'flex items-center px-4 py-2 rounded-lg border transition-colors',
                form.watch('willRevisit') === true
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              )}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              또 가고 싶어요
            </div>
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="false"
              {...form.register('willRevisit', { valueAsBoolean: true })}
              className="sr-only"
            />
            <div
              className={cn(
                'flex items-center px-4 py-2 rounded-lg border transition-colors',
                form.watch('willRevisit') === false
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              )}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              다시는 안 갈래요
            </div>
          </label>
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            fullWidth
          >
            취소
          </Button>
        )}
        <Button
          type="submit"
          loading={loading}
          fullWidth
        >
          {initialData ? '리뷰 수정하기' : '리뷰 작성하기'}
        </Button>
      </div>
    </form>
  );
}
```

### useReviews 훅
```typescript
// src/hooks/useReviews.ts
interface UseReviewsOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'restaurantName';
  sortOrder?: 'asc' | 'desc';
}

export function useReviews(options: UseReviewsOptions = {}) {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const { token } = useAuth();
  
  const queryKey = ['reviews', page, limit, sortBy, sortOrder];
  
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });
      
      const response = await fetch(`/api/reviews?${searchParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('리뷰를 불러오는데 실패했습니다.');
      }
      
      return response.json();
    },
    enabled: !!token,
  });
  
  const createReview = useMutation({
    mutationFn: async (data: CreateReviewInput) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '리뷰 작성에 실패했습니다.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
  
  const updateReview = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReviewInput }) => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '리뷰 수정에 실패했습니다.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
  
  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '리뷰 삭제에 실패했습니다.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
  
  return {
    reviews: data?.data?.reviews || [],
    pagination: data?.data?.pagination,
    isLoading,
    error,
    refetch,
    createReview,
    updateReview,
    deleteReview,
  };
}
```

## 📱 페이지 구현

### 리뷰 목록 페이지
```typescript
// src/app/(main)/reviews/page.tsx
'use client';

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'restaurantName'>('createdAt');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  
  const {
    reviews,
    pagination,
    isLoading,
    createReview,
    updateReview,
    deleteReview,
  } = useReviews({ page, sortBy });
  
  const handleAddReview = async (data: CreateReviewInput) => {
    await createReview.mutateAsync(data);
    setShowAddModal(false);
  };
  
  const handleEditReview = async (data: CreateReviewInput) => {
    if (!editingReview) return;
    
    await updateReview.mutateAsync({
      id: editingReview.id,
      data,
    });
    setEditingReview(null);
  };
  
  const handleDeleteReview = async (id: string) => {
    await deleteReview.mutateAsync(id);
  };
  
  if (isLoading) {
    return <Loading />;
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">내 리뷰</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          리뷰 작성
        </Button>
      </div>
      
      {/* 정렬 옵션 */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={sortBy === 'createdAt' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSortBy('createdAt')}
        >
          최신순
        </Button>
        <Button
          variant={sortBy === 'restaurantName' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSortBy('restaurantName')}
        >
          가나다순
        </Button>
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">아직 작성한 리뷰가 없습니다.</p>
          <Button onClick={() => setShowAddModal(true)}>
            첫 번째 리뷰 작성하기
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={setEditingReview}
              onDelete={handleDeleteReview}
            />
          ))}
        </div>
      )}
      
      {/* 페이지네이션 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          {/* 페이지네이션 컴포넌트 */}
        </div>
      )}
      
      {/* 리뷰 작성 모달 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="리뷰 작성"
        size="lg"
      >
        <ReviewForm
          onSubmit={handleAddReview}
          onCancel={() => setShowAddModal(false)}
          loading={createReview.isPending}
        />
      </Modal>
      
      {/* 리뷰 수정 모달 */}
      <Modal
        isOpen={!!editingReview}
        onClose={() => setEditingReview(null)}
        title="리뷰 수정"
        size="lg"
      >
        {editingReview && (
          <ReviewForm
            initialData={editingReview}
            onSubmit={handleEditReview}
            onCancel={() => setEditingReview(null)}
            loading={updateReview.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
```

## 🛠️ 기술 상세

### 스키마 검증 추가
```typescript
// src/lib/validations.ts에 추가
export const createReviewSchema = z.object({
  restaurantName: z.string()
    .min(1, '식당명을 입력해주세요')
    .max(255, '식당명이 너무 깁니다'),
  address: z.string().max(500, '주소가 너무 깁니다').optional(),
  content: z.string()
    .min(10, '리뷰는 10글자 이상 작성해주세요')
    .max(5000, '리뷰가 너무 깁니다'),
  willRevisit: z.boolean(),
});

export const updateReviewSchema = createReviewSchema;

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
```

## 📋 구현 체크리스트

### API 구현
- [ ] 리뷰 목록 조회 API (정렬, 페이지네이션)
- [ ] 리뷰 작성 API
- [ ] 리뷰 수정 API
- [ ] 리뷰 삭제 API
- [ ] 입력 검증 및 에러 처리

### React 컴포넌트
- [ ] ReviewCard 컴포넌트
- [ ] WillRevisitBadge 컴포넌트
- [ ] ReviewForm 컴포넌트 (재방문 의사 선택 포함)
- [ ] useReviews 훅 구현

### 페이지 구현
- [ ] 리뷰 목록 페이지
- [ ] 정렬 기능 (최신순, 가나다순)
- [ ] 작성/수정 모달 구현
- [ ] 에러 처리 및 로딩 상태

### UX 개선
- [ ] Optimistic Updates 구현
- [ ] 삭제 확인 다이얼로그
- [ ] 재방문 의사 시각적 표현
- [ ] 빈 상태 및 로딩 스켈레톤

## 🎯 완료 조건

1. **CRUD 동작**: 리뷰 작성, 조회, 수정, 삭제 모두 정상 동작
2. **재방문 의사 표시**: 명확한 시각적 구분 및 선택 UI
3. **정렬 기능**: 최신순, 가나다순 정렬 동작
4. **반응형 디자인**: 모바일에서 긴 텍스트 적절히 표시

## 🚀 다음 단계 (Phase 1.5)

리뷰 기능 완성 후 홈 페이지와 프로필 페이지를 구현합니다.