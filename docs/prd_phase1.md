# FlavorNote PRD - Phase 1: MVP 기본 구조

## 🎯 Phase 1 목표

**최소 기능 제품(MVP)**을 구현하여 핵심 사용자 경험을 검증합니다.

### 성공 기준
- [ ] 사용자가 위시리스트를 등록하고 관리할 수 있다
- [ ] 사용자가 후기를 작성하고 조회할 수 있다
- [ ] 기본적인 네비게이션이 동작한다
- [ ] 로그인/회원가입이 동작한다

## 📋 구현 범위

### ✅ 포함 기능

#### 1. 사용자 인증
- **회원가입**: 이메일, 비밀번호, 닉네임
- **로그인**: 이메일/비밀번호 인증
- **JWT 토큰 기반 세션 관리**

#### 2. 위시리스트 기본 기능
- **등록**: 식당명, 주소, 간단한 메모
- **조회**: 목록 형태로 표시
- **수정**: 기본 정보 수정
- **삭제**: 위시리스트에서 제거

#### 3. 후기 기본 기능
- **작성**: 식당명, 주소, 후기 텍스트, 재방문 의사
- **조회**: 목록 형태로 표시
- **수정**: 후기 내용 수정
- **삭제**: 후기 삭제

#### 4. 기본 네비게이션
- **하단 탭**: 홈, 위시리스트, 내 리뷰, 프로필
- **페이지 라우팅**: Next.js App Router 사용
- **기본 헤더**: 제목 표시

### ❌ 제외 기능
- 소셜 기능 (팔로우, 댓글)
- 이미지 업로드
- 태그 시스템
- 검색 기능
- SNS 공유
- 메뉴별 세부 리뷰
- 지도 연동
- 필터링

## 🗄️ 데이터베이스 스키마

### Users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Wishlists 테이블
```sql
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  memo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Reviews 테이블
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  content TEXT NOT NULL,
  will_revisit BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🛣️ API 설계

### 인증 API
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### 위시리스트 API
```typescript
GET    /api/wishlists        // 목록 조회
POST   /api/wishlists        // 새 항목 생성
GET    /api/wishlists/[id]   // 상세 조회
PUT    /api/wishlists/[id]   // 수정
DELETE /api/wishlists/[id]   // 삭제
```

### 후기 API
```typescript
GET    /api/reviews          // 목록 조회
POST   /api/reviews          // 새 리뷰 생성
GET    /api/reviews/[id]     // 상세 조회
PUT    /api/reviews/[id]     // 수정
DELETE /api/reviews/[id]     // 삭제
```

## 📱 페이지 구현 상세

### 1. 로그인/회원가입 (`/auth`)
**컴포넌트**: `AuthForm`, `LoginForm`, `RegisterForm`

```typescript
interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: AuthFormData) => void;
  loading?: boolean;
}

interface AuthFormData {
  email: string;
  password: string;
  nickname?: string; // 회원가입시만
}
```

### 2. 홈 (`/`)
**컴포넌트**: `HomePage`, `RecentActivity`, `QuickActions`

- 최근 작성한 리뷰 3개 표시
- 위시리스트 빠른 추가 버튼
- 기본 대시보드 형태

### 3. 위시리스트 (`/wishlist`)
**컴포넌트**: `WishlistPage`, `WishlistCard`, `WishlistForm`

```typescript
interface WishlistItem {
  id: string;
  restaurantName: string;
  address?: string;
  memo?: string;
  createdAt: Date;
}
```

### 4. 내 리뷰 (`/reviews`)
**컴포넌트**: `ReviewsPage`, `ReviewCard`, `ReviewForm`

```typescript
interface Review {
  id: string;
  restaurantName: string;
  address?: string;
  content: string;
  willRevisit: boolean;
  createdAt: Date;
}
```

### 5. 프로필 (`/profile`)
**컴포넌트**: `ProfilePage`, `UserInfo`, `ActivityStats`

- 기본 사용자 정보 표시
- 리뷰/위시리스트 개수 통계
- 로그아웃 기능

## 🧩 공통 컴포넌트

### Layout 컴포넌트
```typescript
// components/layout/Layout.tsx
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showBottomNav?: boolean;
}

// components/layout/BottomNav.tsx
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType;
}
```

### Form 컴포넌트
```typescript
// components/ui/Input.tsx
interface InputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}
```

## 🛠️ 기술 스택 상세

### Frontend
- **Next.js 14**: App Router 사용
- **TypeScript**: strict 모드 활성화
- **Tailwind CSS**: 스타일링
- **React Hook Form**: 폼 관리
- **Zod**: 스키마 검증

### Backend
- **Next.js API Routes**: 서버 사이드 API
- **PostgreSQL**: 메인 데이터베이스
- **Prisma**: ORM
- **bcrypt**: 비밀번호 해싱
- **jose**: JWT 토큰 관리

### 개발/배포
- **ESLint + Prettier**: 코드 품질
- **Husky**: Git hooks
- **Docker**: 컨테이너화
- **Nginx**: 리버스 프록시

## 📋 개발 체크리스트

### 환경 설정
- [ ] Next.js 프로젝트 초기화
- [ ] TypeScript 설정 (strict 모드)
- [ ] ESLint/Prettier 설정
- [ ] Tailwind CSS 설정
- [ ] PostgreSQL 데이터베이스 설정
- [ ] Prisma 설정

### 기본 구조
- [ ] 폴더 구조 설정
- [ ] Layout 컴포넌트 구현
- [ ] BottomNav 구현
- [ ] 라우팅 설정

### 인증 시스템
- [ ] JWT 토큰 관리 유틸
- [ ] 로그인/회원가입 API
- [ ] AuthContext 구현
- [ ] 보호된 라우트 설정

### 위시리스트 기능
- [ ] 위시리스트 CRUD API
- [ ] WishlistCard 컴포넌트
- [ ] WishlistForm 컴포넌트
- [ ] 위시리스트 페이지

### 리뷰 기능
- [ ] 리뷰 CRUD API
- [ ] ReviewCard 컴포넌트
- [ ] ReviewForm 컴포넌트
- [ ] 리뷰 페이지

### 테스트 & 배포
- [ ] 기본 기능 테스트
- [ ] 반응형 디자인 확인
- [ ] 타입 체크 통과
- [ ] 린트 검사 통과
- [ ] 프로덕션 빌드 테스트

## 📈 Phase 1 완료 후 목표

1. **사용자 피드백 수집**: 핵심 기능 사용성 검증
2. **성능 측정**: 로딩 시간, 반응성 측정
3. **버그 수정**: 발견된 이슈 해결
4. **Phase 2 계획**: 소셜 기능 및 고급 기능 설계

## 🚀 Phase 2 예고

다음 단계에서는 다음 기능들을 추가할 예정입니다:
- 이미지 업로드
- 태그 시스템
- 검색 기능
- 소셜 기능 (팔로우, 댓글)
- 메뉴별 세부 리뷰