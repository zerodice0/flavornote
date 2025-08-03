# FlavorNote PRD - Phase 1.1: 기반 구조 구축

## 🎯 목표
프로젝트의 핵심 기반 구조와 공통 컴포넌트를 구축하여 이후 개발의 토대를 마련합니다.

## 📋 구현 범위

### ✅ 포함 기능

#### 1. 레이아웃 시스템
- **RootLayout**: 전체 앱 레이아웃 (HTML, 헤드, 글로벌 스타일)
- **MainLayout**: 공통 레이아웃 (헤더 + 컨텐츠 + 하단 네비게이션)
- **AuthLayout**: 인증 페이지 전용 레이아웃

#### 2. 하단 네비게이션
- **BottomNav 컴포넌트**: 4개 탭 (홈, 위시리스트, 리뷰, 프로필)
- **아이콘 시스템**: Lucide React 아이콘 사용
- **활성 상태 표시**: 현재 페이지 하이라이트

#### 3. 기본 UI 컴포넌트
- **Button**: primary, secondary, danger 변형
- **Input**: text, email, password, textarea 타입
- **Loading**: 스피너 및 스켈레톤 로더
- **Modal**: 팝업 창 기본 구조

#### 4. 유틸리티 및 설정
- **Tailwind CSS 확장**: 커스텀 컬러, 스페이싱
- **타입 정의**: 기본 인터페이스들
- **상수 정의**: API 엔드포인트, 라벨들

### ❌ 제외 기능
- 인증 로직
- 데이터 페칭
- 비즈니스 로직
- 실제 API 연동

## 🏗️ 컴포넌트 구조

### Layout 컴포넌트
```typescript
// src/components/layout/RootLayout.tsx
interface RootLayoutProps {
  children: React.ReactNode;
}

// src/components/layout/MainLayout.tsx
interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showBottomNav?: boolean;
}

// src/components/layout/AuthLayout.tsx
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}
```

### BottomNav 컴포넌트
```typescript
// src/components/layout/BottomNav.tsx
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '홈', href: '/', icon: Home },
  { id: 'wishlist', label: '위시리스트', href: '/wishlist', icon: Heart },
  { id: 'reviews', label: '내 리뷰', href: '/reviews', icon: Star },
  { id: 'profile', label: '프로필', href: '/profile', icon: User },
];
```

### 확장된 UI 컴포넌트
```typescript
// src/components/ui/Button.tsx (기존 확장)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

// src/components/ui/Input.tsx (기존 확장)
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

// src/components/ui/Loading.tsx
interface LoadingProps {
  type?: 'spinner' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// src/components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

## 🎨 디자인 시스템

### 컬러 팔레트
```typescript
// tailwind.config.ts 확장
const colors = {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    600: '#4b5563',
    900: '#111827',
  }
};
```

### 스페이싱 시스템
```typescript
const spacing = {
  'safe-top': 'env(safe-area-inset-top)',
  'safe-bottom': 'env(safe-area-inset-bottom)',
  'nav-height': '4rem', // 64px
  'header-height': '3.5rem', // 56px
};
```

## 📱 페이지 구조

### 기본 페이지 틀
```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={cn(inter.className, 'bg-gray-50')}>
        {children}
      </body>
    </html>
  );
}

// src/app/(main)/layout.tsx
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout showBottomNav>
      {children}
    </MainLayout>
  );
}

// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout title="FlavorNote">
      {children}
    </AuthLayout>
  );
}
```

### 플레이스홀더 페이지들
```typescript
// src/app/(main)/page.tsx - 홈 페이지
// src/app/(main)/wishlist/page.tsx - 위시리스트 페이지
// src/app/(main)/reviews/page.tsx - 리뷰 페이지
// src/app/(main)/profile/page.tsx - 프로필 페이지
// src/app/(auth)/login/page.tsx - 로그인 페이지
// src/app/(auth)/register/page.tsx - 회원가입 페이지
```

## 🛠️ 기술 상세

### 필요한 추가 패키지
```json
{
  "dependencies": {
    "lucide-react": "^0.400.0",
    "react-hook-form": "^7.48.0"
  }
}
```

### Tailwind CSS 설정 확장
```typescript
// tailwind.config.ts에 추가
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors,
      spacing,
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-bottom))',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      }
    },
  },
};
```

## 📋 구현 체크리스트

### 레이아웃 시스템
- [ ] RootLayout 컴포넌트 구현
- [ ] MainLayout 컴포넌트 구현  
- [ ] AuthLayout 컴포넌트 구현
- [ ] 라우트 그룹 설정 ((main), (auth))

### BottomNav 구현
- [ ] BottomNav 컴포넌트 구현
- [ ] Lucide React 아이콘 설정
- [ ] 활성 상태 로직 구현
- [ ] 모바일 Safe Area 대응

### UI 컴포넌트 확장
- [ ] Button 컴포넌트 변형 추가
- [ ] Input 컴포넌트 기능 확장
- [ ] Loading 컴포넌트 구현
- [ ] Modal 컴포넌트 구현

### 기본 페이지 구조
- [ ] 6개 플레이스홀더 페이지 생성
- [ ] 페이지별 기본 레이아웃 적용
- [ ] 라우팅 동작 확인

### 스타일링 시스템
- [ ] Tailwind 설정 확장
- [ ] 커스텀 컬러 시스템 적용
- [ ] 반응형 디자인 기본 설정
- [ ] 다크 모드 기본 준비

## 🎯 완료 조건

1. **네비게이션 동작**: 하단 탭으로 페이지 간 이동 가능
2. **레이아웃 일관성**: 모든 페이지에서 일관된 레이아웃 표시
3. **반응형 동작**: 모바일/데스크톱에서 적절한 표시
4. **컴포넌트 재사용**: 기본 UI 컴포넌트들이 스토리북 수준으로 동작

## 🚀 다음 단계 (Phase 1.2)

기반 구조 완성 후 데이터베이스 및 인증 시스템 구축을 진행합니다.