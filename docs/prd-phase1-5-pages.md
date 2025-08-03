# FlavorNote PRD - Phase 1.5: 홈 페이지 및 프로필 페이지 구현

## 🎯 목표
사용자의 주요 활동 공간인 홈 페이지와 개인 정보 관리를 위한 프로필 페이지를 완성하여 Phase 1의 핵심 사용자 경험을 제공합니다.

## 📋 구현 범위

### ✅ 포함 기능

#### 1. 홈 페이지
- **최근 리뷰 섹션**: 작성한 리뷰 3개 최신순 표시
- **위시리스트 미리보기**: 등록한 위시리스트 3개 표시
- **통계 대시보드**: 리뷰 수, 위시리스트 수, 재방문 비율
- **빠른 액션**: 리뷰 작성, 위시리스트 추가 버튼

#### 2. 프로필 페이지
- **사용자 정보 표시**: 닉네임, 이메일, 가입일
- **통계 정보**: 전체 리뷰 수, 위시리스트 수, 계정 생성일
- **빠른 네비게이션**: 내 리뷰, 위시리스트로 이동
- **로그아웃 기능**: 안전한 로그아웃 처리

#### 3. 데이터 연동
- **React Query 통합**: 홈 페이지 데이터 효율적 관리
- **실시간 동기화**: 다른 페이지 액션 후 홈 데이터 자동 업데이트
- **캐싱 전략**: 자주 사용되는 데이터 캐싱

### ❌ 제외 기능
- 피드 기능
- 사용자 팔로우
- 소셜 공유
- 검색 기능
- 알림 시스템

## 🏠 홈 페이지 구현 상세

### 홈 데이터 API
```typescript
// src/app/api/home/route.ts
export async function GET(request: Request) {
  try {
    const user = await authMiddleware(request);
    if (!user) return;
    
    const [recentReviews, recentWishlists, stats] = await Promise.all([
      // 최근 리뷰 3개
      prisma.review.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      
      // 최근 위시리스트 3개
      prisma.wishlist.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      
      // 통계 데이터
      prisma.$transaction([
        prisma.review.count({
          where: { userId: user.userId },
        }),
        prisma.wishlist.count({
          where: { userId: user.userId },
        }),
        prisma.review.count({
          where: { 
            userId: user.userId,
            willRevisit: true,
          },
        }),
      ])
    ]);
    
    const [totalReviews, totalWishlists, willRevisitCount] = stats;
    const revisitRate = totalReviews > 0 ? Math.round((willRevisitCount / totalReviews) * 100) : 0;
    
    return Response.json({
      success: true,
      data: {
        recentReviews,
        recentWishlists,
        stats: {
          totalReviews,
          totalWishlists,
          revisitRate,
        },
      },
    });
    
  } catch (error) {
    return Response.json(
      { success: false, error: '홈 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 홈 페이지 컴포넌트
```typescript
// src/app/(main)/page.tsx
'use client';

import { useHomeData } from '@/hooks/useHomeData';
import { StatsCard } from '@/components/features/home/StatsCard';
import { QuickActions } from '@/components/features/home/QuickActions';
import { RecentSection } from '@/components/features/home/RecentSection';

export default function HomePage() {
  const { data, isLoading, error } = useHomeData();
  
  if (isLoading) {
    return <HomePageSkeleton />;
  }
  
  if (error) {
    return <ErrorMessage message="홈 데이터를 불러올 수 없습니다." />;
  }
  
  const { recentReviews, recentWishlists, stats } = data;
  
  return (
    <div className="p-4 space-y-6">
      {/* 환영 메시지 */}
      <WelcomeSection />
      
      {/* 빠른 액션 */}
      <QuickActions />
      
      {/* 통계 대시보드 */}
      <section>
        <h2 className="text-lg font-semibold mb-3">나의 기록</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatsCard
            label="리뷰"
            value={stats.totalReviews}
            icon={Star}
            color="blue"
          />
          <StatsCard
            label="위시리스트"
            value={stats.totalWishlists}
            icon={Heart}
            color="red"
          />
          <StatsCard
            label="재방문률"
            value={`${stats.revisitRate}%`}
            icon={TrendingUp}
            color="green"
          />
        </div>
      </section>
      
      {/* 최근 리뷰 */}
      <RecentSection
        title="최근 리뷰"
        items={recentReviews}
        renderItem={(review) => (
          <ReviewCard key={review.id} review={review} showActions={false} />
        )}
        emptyMessage="아직 작성한 리뷰가 없습니다."
        viewAllHref="/reviews"
      />
      
      {/* 최근 위시리스트 */}
      <RecentSection
        title="최근 위시리스트"
        items={recentWishlists}
        renderItem={(wishlist) => (
          <WishlistCard key={wishlist.id} wishlist={wishlist} />
        )}
        emptyMessage="아직 등록한 위시리스트가 없습니다."
        viewAllHref="/wishlist"
      />
    </div>
  );
}
```

### 홈 페이지 전용 컴포넌트들
```typescript
// src/components/features/home/WelcomeSection.tsx
export function WelcomeSection() {
  const { user } = useAuth();
  const currentHour = new Date().getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) return '좋은 아침이에요';
    if (currentHour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };
  
  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
      <h1 className="text-xl font-bold mb-1">
        {getGreeting()}, {user?.nickname}님!
      </h1>
      <p className="text-primary-100">
        오늘은 어떤 맛집을 발견해볼까요?
      </p>
    </div>
  );
}

// src/components/features/home/QuickActions.tsx
export function QuickActions() {
  const router = useRouter();
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        className="h-20 flex-col gap-2"
        onClick={() => router.push('/reviews/add')}
      >
        <Plus className="w-6 h-6" />
        <span>리뷰 작성</span>
      </Button>
      <Button
        variant="outline"
        className="h-20 flex-col gap-2"
        onClick={() => router.push('/wishlist/add')}
      >
        <Heart className="w-6 h-6" />
        <span>위시리스트 추가</span>
      </Button>
    </div>
  );
}

// src/components/features/home/StatsCard.tsx
interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'red' | 'green';
}

export function StatsCard({ label, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
  };
  
  return (
    <div className={cn(
      'border rounded-lg p-3 text-center',
      colorClasses[color]
    )}>
      <Icon className="w-5 h-5 mx-auto mb-2" />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

// src/components/features/home/RecentSection.tsx
interface RecentSectionProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage: string;
  viewAllHref: string;
}

export function RecentSection<T>({ 
  title, 
  items, 
  renderItem, 
  emptyMessage, 
  viewAllHref 
}: RecentSectionProps<T>) {
  const router = useRouter();
  
  return (
    <section>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(viewAllHref)}
          >
            전체보기
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(renderItem)}
        </div>
      )}
    </section>
  );
}
```

## 👤 프로필 페이지 구현 상세

### 프로필 페이지 컴포넌트
```typescript
// src/app/(main)/profile/page.tsx
'use client';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { data: stats, isLoading } = useUserStats();
  const router = useRouter();
  
  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      logout();
      router.push('/auth/login');
    }
  };
  
  if (!user) {
    return <Loading />;
  }
  
  return (
    <div className="p-4 space-y-6">
      {/* 프로필 헤더 */}
      <ProfileHeader user={user} />
      
      {/* 통계 섹션 */}
      <ProfileStats stats={stats} isLoading={isLoading} />
      
      {/* 빠른 네비게이션 */}
      <QuickNavigation />
      
      {/* 설정 섹션 */}
      <SettingsSection onLogout={handleLogout} />
    </div>
  );
}

// src/components/features/profile/ProfileHeader.tsx
interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <User className="w-10 h-10 text-primary-600" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">
        {user.nickname}
      </h1>
      <p className="text-gray-600 text-sm mb-2">
        {user.email}
      </p>
      <p className="text-gray-500 text-xs">
        {format(new Date(user.createdAt), 'yyyy년 MM월에 가입')}
      </p>
    </div>
  );
}

// src/components/features/profile/ProfileStats.tsx
interface ProfileStatsProps {
  stats?: {
    totalReviews: number;
    totalWishlists: number;
    revisitRate: number;
  };
  isLoading: boolean;
}

export function ProfileStats({ stats, isLoading }: ProfileStatsProps) {
  if (isLoading) {
    return <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />;
  }
  
  if (!stats) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="font-semibold text-gray-900 mb-3">활동 통계</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {stats.totalReviews}
          </div>
          <div className="text-sm text-gray-600">리뷰</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {stats.totalWishlists}
          </div>
          <div className="text-sm text-gray-600">위시리스트</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.revisitRate}%
          </div>
          <div className="text-sm text-gray-600">재방문률</div>
        </div>
      </div>
    </div>
  );
}

// src/components/features/profile/QuickNavigation.tsx
export function QuickNavigation() {
  const router = useRouter();
  
  const navItems = [
    {
      label: '내 리뷰',
      icon: Star,
      href: '/reviews',
      description: '작성한 리뷰 관리',
    },
    {
      label: '위시리스트',
      icon: Heart,
      href: '/wishlist',
      description: '가고싶은 식당 관리',
    },
  ];
  
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-gray-900 mb-3">빠른 이동</h2>
      {navItems.map((item) => (
        <button
          key={item.href}
          onClick={() => router.push(item.href)}
          className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center hover:bg-gray-50 transition-colors"
        >
          <item.icon className="w-5 h-5 text-gray-600 mr-3" />
          <div className="flex-1 text-left">
            <div className="font-medium text-gray-900">{item.label}</div>
            <div className="text-sm text-gray-600">{item.description}</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      ))}
    </div>
  );
}

// src/components/features/profile/SettingsSection.tsx
interface SettingsSectionProps {
  onLogout: () => void;
}

export function SettingsSection({ onLogout }: SettingsSectionProps) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-gray-900 mb-3">설정</h2>
      <button
        onClick={onLogout}
        className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-5 h-5 text-red-600 mr-3" />
        <span className="text-red-600 font-medium">로그아웃</span>
      </button>
    </div>
  );
}
```

## 🔗 커스텀 훅 구현

### useHomeData 훅
```typescript
// src/hooks/useHomeData.ts
export function useHomeData() {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['home-data'],
    queryFn: async () => {
      const response = await fetch('/api/home', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('홈 데이터를 불러오는데 실패했습니다.');
      }
      
      return response.json();
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}
```

### useUserStats 훅
```typescript
// src/hooks/useUserStats.ts
export function useUserStats() {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await fetch('/api/user/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('통계 데이터를 불러오는데 실패했습니다.');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10분간 캐시 유지
  });
}
```

## 🛠️ 기술 상세

### 필요한 추가 컴포넌트
```typescript
// src/components/ui/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="text-center py-8">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}

// src/components/ui/HomePageSkeleton.tsx
export function HomePageSkeleton() {
  return (
    <div className="p-4 space-y-6">
      {/* 환영 섹션 스켈레톤 */}
      <div className="bg-gray-200 rounded-lg h-20 animate-pulse" />
      
      {/* 빠른 액션 스켈레톤 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-200 rounded-lg h-20 animate-pulse" />
        <div className="bg-gray-200 rounded-lg h-20 animate-pulse" />
      </div>
      
      {/* 통계 스켈레톤 */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-16 animate-pulse" />
        ))}
      </div>
      
      {/* 리스트 스켈레톤 */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
```

## 📋 구현 체크리스트

### 홈 페이지
- [ ] 홈 데이터 API 구현
- [ ] WelcomeSection 컴포넌트
- [ ] QuickActions 컴포넌트
- [ ] StatsCard 컴포넌트
- [ ] RecentSection 컴포넌트
- [ ] useHomeData 훅 구현
- [ ] 홈 페이지 스켈레톤 로더

### 프로필 페이지
- [ ] ProfileHeader 컴포넌트
- [ ] ProfileStats 컴포넌트
- [ ] QuickNavigation 컴포넌트
- [ ] SettingsSection 컴포넌트
- [ ] useUserStats 훅 구현
- [ ] 로그아웃 기능 구현

### 데이터 연동
- [ ] React Query 캐싱 전략
- [ ] 에러 처리 및 폴백 UI
- [ ] 실시간 데이터 동기화
- [ ] 성능 최적화

### UX 개선
- [ ] 로딩 상태 처리
- [ ] 에러 상태 처리
- [ ] 빈 상태 메시지
- [ ] 부드러운 애니메이션

## 🎯 완료 조건

1. **홈 페이지 동작**: 사용자 데이터 기반 개인화된 홈 화면 표시
2. **프로필 페이지 동작**: 사용자 정보와 통계 정확한 표시
3. **네비게이션 연동**: 홈에서 다른 페이지로 원활한 이동
4. **실시간 업데이트**: 다른 페이지에서 변경 시 홈 데이터 자동 갱신

## 🚀 다음 단계 (Phase 1.6)

홈 및 프로필 페이지 완성 후 통합 테스트와 배포 준비를 진행합니다.