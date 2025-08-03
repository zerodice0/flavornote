# FlavorNote PRD - Phase 1.3: 위시리스트 기능 구현

## 🎯 목표
사용자가 가고 싶은 식당을 등록, 조회, 수정, 삭제할 수 있는 위시리스트 CRUD 기능을 완성합니다.

## 📋 구현 범위

### ✅ 포함 기능

#### 1. 위시리스트 API
- **목록 조회**: `GET /api/wishlists` - 사용자별 위시리스트 페이지네이션
- **상세 조회**: `GET /api/wishlists/[id]` - 특정 위시리스트 아이템
- **새 항목 생성**: `POST /api/wishlists` - 새 식당 위시리스트 추가
- **수정**: `PUT /api/wishlists/[id]` - 기존 항목 정보 수정
- **삭제**: `DELETE /api/wishlists/[id]` - 위시리스트에서 제거

#### 2. 위시리스트 UI 컴포넌트
- **WishlistCard**: 위시리스트 아이템 카드 표시
- **WishlistForm**: 새 항목 추가/수정 폼
- **WishlistList**: 위시리스트 목록 컨테이너
- **AddWishlistModal**: 빠른 추가 모달

#### 3. 위시리스트 페이지
- **위시리스트 목록 페이지**: `/wishlist` - 전체 위시리스트 표시
- **위시리스트 추가 페이지**: `/wishlist/add` - 새 항목 추가 폼
- **위시리스트 수정 페이지**: `/wishlist/[id]/edit` - 기존 항목 수정

#### 4. 상태 관리 및 데이터 페칭
- **useWishlists 훅**: 위시리스트 데이터 관리
- **React Query 통합**: 캐싱 및 동기화
- **Optimistic Updates**: 빠른 UI 반응

### ❌ 제외 기능
- 태그 시스템
- 이미지 업로드
- 예산 범위 설정
- 긴급도 표시
- 검색 및 필터링

## 🛣️ API 구현 상세

### 1. 위시리스트 목록 조회 API
```typescript
// src/app/api/wishlists/route.ts
export async function GET(request: Request) {
  try {
    const user = await authMiddleware(request);
    if (!user) return; // authMiddleware에서 이미 에러 응답 반환
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const [wishlists, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.wishlist.count({
        where: { userId: user.userId },
      }),
    ]);
    
    return Response.json({
      success: true,
      data: {
        wishlists,
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
      { success: false, error: '위시리스트를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 2. 위시리스트 생성 API
```typescript
// src/app/api/wishlists/route.ts
export async function POST(request: Request) {
  try {
    const user = await authMiddleware(request);
    if (!user) return;
    
    const body = await request.json();
    const validatedData = createWishlistSchema.parse(body);
    
    const wishlist = await prisma.wishlist.create({
      data: {
        ...validatedData,
        userId: user.userId,
      },
    });
    
    return Response.json({
      success: true,
      data: wishlist,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: '입력 데이터가 올바르지 않습니다.', details: error.errors },
        { status: 400 }
      );
    }
    
    return Response.json(
      { success: false, error: '위시리스트 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 3. 위시리스트 수정/삭제 API
```typescript
// src/app/api/wishlists/[id]/route.ts
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(request);
    if (!user) return;
    
    const body = await request.json();
    const validatedData = updateWishlistSchema.parse(body);
    
    // 소유권 확인
    const existingWishlist = await prisma.wishlist.findFirst({
      where: { id: params.id, userId: user.userId },
    });
    
    if (!existingWishlist) {
      return Response.json(
        { success: false, error: '위시리스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const wishlist = await prisma.wishlist.update({
      where: { id: params.id },
      data: validatedData,
    });
    
    return Response.json({
      success: true,
      data: wishlist,
    });
    
  } catch (error) {
    return Response.json(
      { success: false, error: '위시리스트 수정에 실패했습니다.' },
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
    const deletedWishlist = await prisma.wishlist.deleteMany({
      where: { id: params.id, userId: user.userId },
    });
    
    if (deletedWishlist.count === 0) {
      return Response.json(
        { success: false, error: '위시리스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: '위시리스트에서 삭제되었습니다.',
    });
    
  } catch (error) {
    return Response.json(
      { success: false, error: '위시리스트 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

## ⚛️ React 컴포넌트 구현

### WishlistCard 컴포넌트
```typescript
// src/components/features/wishlist/WishlistCard.tsx
interface WishlistCardProps {
  wishlist: Wishlist;
  onEdit?: (wishlist: Wishlist) => void;
  onDelete?: (id: string) => void;
}

export function WishlistCard({ wishlist, onEdit, onDelete }: WishlistCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!confirm('이 위시리스트를 삭제하시겠습니까?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete?.(wishlist.id);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-900">
          {wishlist.restaurantName}
        </h3>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(wishlist)}
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
      </div>
      
      {wishlist.address && (
        <p className="text-gray-600 text-sm mb-2">
          <MapPin className="w-3 h-3 inline mr-1" />
          {wishlist.address}
        </p>
      )}
      
      {wishlist.memo && (
        <p className="text-gray-700 text-sm mb-3">
          {wishlist.memo}
        </p>
      )}
      
      <p className="text-gray-500 text-xs">
        {format(new Date(wishlist.createdAt), 'yyyy.MM.dd')} 추가
      </p>
    </div>
  );
}
```

### WishlistForm 컴포넌트
```typescript
// src/components/features/wishlist/WishlistForm.tsx
interface WishlistFormProps {
  initialData?: Partial<Wishlist>;
  onSubmit: (data: CreateWishlistInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function WishlistForm({ initialData, onSubmit, onCancel, loading }: WishlistFormProps) {
  const form = useForm<CreateWishlistInput>({
    resolver: zodResolver(createWishlistSchema),
    defaultValues: {
      restaurantName: initialData?.restaurantName || '',
      address: initialData?.address || '',
      memo: initialData?.memo || '',
    },
  });
  
  const handleSubmit = async (data: CreateWishlistInput) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // 에러는 상위 컴포넌트에서 처리
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <Input
        label="식당명"
        placeholder="식당 이름을 입력하세요"
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
        label="메모"
        type="textarea"
        placeholder="특별한 메모가 있다면 적어주세요 (선택)"
        {...form.register('memo')}
        error={form.formState.errors.memo?.message}
      />
      
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
          {initialData ? '수정하기' : '위시리스트에 추가'}
        </Button>
      </div>
    </form>
  );
}
```

### useWishlists 훅
```typescript
// src/hooks/useWishlists.ts
interface UseWishlistsOptions {
  page?: number;
  limit?: number;
}

export function useWishlists(options: UseWishlistsOptions = {}) {
  const { page = 1, limit = 10 } = options;
  const { token } = useAuth();
  
  const queryKey = ['wishlists', page, limit];
  
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/wishlists?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('위시리스트를 불러오는데 실패했습니다.');
      }
      
      return response.json();
    },
    enabled: !!token,
  });
  
  const createWishlist = useMutation({
    mutationFn: async (data: CreateWishlistInput) => {
      const response = await fetch('/api/wishlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '위시리스트 추가에 실패했습니다.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });
  
  const updateWishlist = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWishlistInput }) => {
      const response = await fetch(`/api/wishlists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '위시리스트 수정에 실패했습니다.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });
  
  const deleteWishlist = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/wishlists/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '위시리스트 삭제에 실패했습니다.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });
  
  return {
    wishlists: data?.data?.wishlists || [],
    pagination: data?.data?.pagination,
    isLoading,
    error,
    refetch,
    createWishlist,
    updateWishlist,
    deleteWishlist,
  };
}
```

## 📱 페이지 구현

### 위시리스트 목록 페이지
```typescript
// src/app/(main)/wishlist/page.tsx
'use client';

export default function WishlistPage() {
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWishlist, setEditingWishlist] = useState<Wishlist | null>(null);
  
  const {
    wishlists,
    pagination,
    isLoading,
    createWishlist,
    updateWishlist,
    deleteWishlist,
  } = useWishlists({ page });
  
  const handleAddWishlist = async (data: CreateWishlistInput) => {
    await createWishlist.mutateAsync(data);
    setShowAddModal(false);
  };
  
  const handleEditWishlist = async (data: CreateWishlistInput) => {
    if (!editingWishlist) return;
    
    await updateWishlist.mutateAsync({
      id: editingWishlist.id,
      data,
    });
    setEditingWishlist(null);
  };
  
  const handleDeleteWishlist = async (id: string) => {
    await deleteWishlist.mutateAsync(id);
  };
  
  if (isLoading) {
    return <Loading />;
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">위시리스트</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          추가
        </Button>
      </div>
      
      {wishlists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">아직 위시리스트가 없습니다.</p>
          <Button onClick={() => setShowAddModal(true)}>
            첫 번째 식당 추가하기
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlists.map((wishlist) => (
            <WishlistCard
              key={wishlist.id}
              wishlist={wishlist}
              onEdit={setEditingWishlist}
              onDelete={handleDeleteWishlist}
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
      
      {/* 추가 모달 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="위시리스트 추가"
      >
        <WishlistForm
          onSubmit={handleAddWishlist}
          onCancel={() => setShowAddModal(false)}
          loading={createWishlist.isPending}
        />
      </Modal>
      
      {/* 수정 모달 */}
      <Modal
        isOpen={!!editingWishlist}
        onClose={() => setEditingWishlist(null)}
        title="위시리스트 수정"
      >
        {editingWishlist && (
          <WishlistForm
            initialData={editingWishlist}
            onSubmit={handleEditWishlist}
            onCancel={() => setEditingWishlist(null)}
            loading={updateWishlist.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
```

## 🛠️ 기술 상세

### 필요한 추가 패키지
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.8.0",
    "date-fns": "^2.30.0"
  }
}
```

### 스키마 검증 추가
```typescript
// src/lib/validations.ts에 추가
export const createWishlistSchema = z.object({
  restaurantName: z.string()
    .min(1, '식당명을 입력해주세요')
    .max(255, '식당명이 너무 깁니다'),
  address: z.string().max(500, '주소가 너무 깁니다').optional(),
  memo: z.string().max(1000, '메모가 너무 깁니다').optional(),
});

export const updateWishlistSchema = createWishlistSchema;

export type CreateWishlistInput = z.infer<typeof createWishlistSchema>;
export type UpdateWishlistInput = z.infer<typeof updateWishlistSchema>;
```

## 📋 구현 체크리스트

### API 구현
- [ ] 위시리스트 목록 조회 API
- [ ] 위시리스트 생성 API
- [ ] 위시리스트 수정 API
- [ ] 위시리스트 삭제 API
- [ ] 페이지네이션 구현

### React 컴포넌트
- [ ] WishlistCard 컴포넌트
- [ ] WishlistForm 컴포넌트
- [ ] useWishlists 훅 구현
- [ ] React Query 설정

### 페이지 구현
- [ ] 위시리스트 목록 페이지
- [ ] 추가/수정 모달 구현
- [ ] 에러 처리 및 로딩 상태
- [ ] 빈 상태 처리

### UX 개선
- [ ] Optimistic Updates 구현
- [ ] 삭제 확인 다이얼로그
- [ ] 성공/실패 토스트 메시지
- [ ] 무한 스크롤 또는 페이지네이션

## 🎯 완료 조건

1. **CRUD 동작**: 위시리스트 생성, 조회, 수정, 삭제 모두 동작
2. **실시간 업데이트**: 액션 후 즉시 UI 반영
3. **에러 처리**: 적절한 에러 메시지 및 로딩 상태 표시
4. **반응형 디자인**: 모바일에서 터치 친화적 인터페이스

## 🚀 다음 단계 (Phase 1.4)

위시리스트 기능 완성 후 리뷰 CRUD 기능을 구현합니다.