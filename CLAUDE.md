# FlavorNote 개발 규칙 및 가이드라인

## 🎯 프로젝트 개요

**FlavorNote**는 Next.js + TypeScript를 사용한 풀스택 맛집 리뷰 플랫폼입니다.
미니PC 환경에서 자체 호스팅되며, 높은 코드 품질과 유지보수성을 목표로 합니다.

## 🛠️ 기술 스택

### Core Stack
- **Frontend/Backend**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Authentication**: JWT (jose library)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript Compiler
- **Git Hooks**: Husky
- **Testing**: Jest + Testing Library

### Deployment
- **Environment**: 미니PC (Ubuntu/Debian)
- **Container**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
- **Process Manager**: PM2

## 📁 프로젝트 구조

```
flavornote/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 인증 관련 페이지 그룹
│   │   ├── api/               # API Routes
│   │   ├── globals.css        # 글로벌 스타일
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   └── page.tsx           # 홈 페이지
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   ├── forms/            # 폼 관련 컴포넌트
│   │   └── features/         # 기능별 컴포넌트
│   ├── lib/                   # 유틸리티 및 설정
│   │   ├── auth.ts           # 인증 관련 유틸
│   │   ├── db.ts             # 데이터베이스 연결
│   │   ├── utils.ts          # 공통 유틸리티
│   │   └── validations.ts    # 스키마 검증
│   ├── hooks/                 # 커스텀 React 훅
│   ├── types/                 # TypeScript 타입 정의
│   └── constants/             # 상수 정의
├── prisma/                    # Prisma 스키마 및 마이그레이션
├── public/                    # 정적 파일
├── docker/                    # Docker 설정 파일
├── docs/                      # 문서
└── scripts/                   # 빌드/배포 스크립트
```

## 🔧 TypeScript 설정

### tsconfig.json 기본 규칙
```json
{
  "compilerOptions": {
    "strict": true,                    // strict 모드 활성화
    "noImplicitAny": true,            // implicit any 금지
    "noImplicitReturns": true,        // 명시적 return 필수
    "noImplicitThis": true,           // implicit this 금지
    "noUnusedLocals": true,           // 미사용 로컬 변수 경고
    "noUnusedParameters": true,       // 미사용 매개변수 경고
    "exactOptionalPropertyTypes": true // 정확한 선택적 속성 타입
  }
}
```

### 타입 정의 규칙
```typescript
// ✅ 올바른 예시
interface User {
  id: string;
  email: string;
  nickname: string;
  createdAt: Date;
}

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 컴포넌트 Props
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

// ❌ 피해야 할 예시
const user: any = {};              // any 사용 금지
function handleClick(event) {}     // 타입 미지정 금지
```

## 🎨 코딩 스타일 가이드

### 네이밍 컨벤션
```typescript
// 변수, 함수: camelCase
const userName = 'john';
const getUserData = () => {};

// 상수: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const API_ENDPOINTS = {
  USERS: '/api/users',
  REVIEWS: '/api/reviews'
} as const;

// 컴포넌트, 타입, 인터페이스: PascalCase
interface UserProfile {}
type ReviewStatus = 'draft' | 'published';
const UserCard = () => {};

// 파일명: kebab-case (컴포넌트는 PascalCase)
user-profile.ts
UserCard.tsx
api-client.ts
```

### 함수 정의 규칙
```typescript
// ✅ 화살표 함수 (기본)
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ function 선언 (호이스팅 필요시)
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ✅ 비동기 함수
const fetchUserData = async (userId: string): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  return response.json();
};
```

### 컴포넌트 구조
```typescript
// ✅ 올바른 컴포넌트 구조
import React from 'react';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
  className?: string;
  onFollow?: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  className,
  onFollow
}) => {
  const handleFollowClick = () => {
    onFollow?.(user.id);
  };

  return (
    <div className={cn('border rounded-lg p-4', className)}>
      <h3 className="font-semibold">{user.nickname}</h3>
      <p className="text-gray-600">{user.email}</p>
      {onFollow && (
        <button 
          onClick={handleFollowClick}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          팔로우
        </button>
      )}
    </div>
  );
};
```

## 🔍 코드 품질 도구

### ESLint 설정 (.eslintrc.json)
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn"
  }
}
```

### Prettier 설정 (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 개발 워크플로우
```bash
# 개발 시작 전
npm run type-check    # TypeScript 타입 체크
npm run lint         # ESLint 검사
npm run lint:fix     # 자동 수정 가능한 린트 오류 수정

# 커밋 전 (Husky로 자동화)
npm run validate     # 전체 검사 (타입체크 + 린트 + 테스트)
```

## 🗄️ 데이터베이스 규칙

### Prisma 스키마 규칙
```prisma
// 1. 모든 테이블은 UUID 기본키 사용
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  nickname  String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}

// 2. 관계 설정시 cascade 규칙 명시
model Review {
  id     String @id @default(cuid())
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("reviews")
}

// 3. 인덱스 명시적 설정
model Follow {
  followerId  String @map("follower_id")
  followingId String @map("following_id")
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follows")
}
```

### 데이터베이스 마이그레이션 규칙
```bash
# 개발 환경 스키마 변경
npx prisma db push

# 프로덕션 마이그레이션 생성
npx prisma migrate dev --name add_user_profile

# 마이그레이션 적용 (프로덕션)
npx prisma migrate deploy
```

## 🔒 보안 규칙

### 환경 변수 관리
```bash
# .env.local (개발)
DATABASE_URL="postgresql://username:password@localhost:5432/flavornote_dev"
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"

# .env.production (프로덕션)
DATABASE_URL="postgresql://..."
JWT_SECRET="different-production-secret"
NODE_ENV="production"
```

### API 보안 규칙
```typescript
// 모든 보호된 라우트에 인증 검증
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyToken(token);
    
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // API 로직...
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

// 입력 검증 필수
import { z } from 'zod';

const createReviewSchema = z.object({
  restaurantName: z.string().min(1).max(255),
  content: z.string().min(10).max(5000),
  willRevisit: z.boolean(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validatedData = createReviewSchema.parse(body);
  // 검증된 데이터로 작업...
}
```

## 📱 반응형 디자인 규칙

### Tailwind CSS 사용 규칙
```typescript
// ✅ 반응형 우선 설계
<div className="
  w-full 
  px-4 
  sm:px-6 
  md:px-8 
  lg:max-w-4xl 
  lg:mx-auto
">

// ✅ 컴포넌트별 스타일 유틸리티
const cardStyles = cn(
  'bg-white rounded-lg shadow-md',
  'border border-gray-200',
  'hover:shadow-lg transition-shadow',
  'dark:bg-gray-800 dark:border-gray-700'
);

// ❌ 인라인 스타일 사용 금지
<div style={{ margin: '10px' }}> // 금지
```

### 모바일 우선 브레이크포인트
```css
/* Tailwind 기본 브레이크포인트 */
sm: 640px   /* 스마트폰 가로 */
md: 768px   /* 태블릿 세로 */
lg: 1024px  /* 태블릿 가로, 작은 노트북 */
xl: 1280px  /* 데스크톱 */
2xl: 1536px /* 큰 데스크톱 */
```

## 🧪 테스트 규칙

### 단위 테스트
```typescript
// __tests__/utils.test.ts
import { validateEmail } from '@/lib/utils';

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should return false for invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
```

### 컴포넌트 테스트
```typescript
// __tests__/components/UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from '@/components/UserCard';

const mockUser = {
  id: '1',
  nickname: 'testuser',
  email: 'test@example.com'
};

describe('UserCard', () => {
  it('renders user information', () => {
    render(<UserCard user={mockUser} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('calls onFollow when follow button is clicked', () => {
    const onFollow = jest.fn();
    render(<UserCard user={mockUser} onFollow={onFollow} />);
    
    fireEvent.click(screen.getByText('팔로우'));
    expect(onFollow).toHaveBeenCalledWith('1');
  });
});
```

## 🚀 배포 및 운영 규칙

### Docker 설정
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose (미니PC 환경)
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=flavornote
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### 배포 스크립트
```bash
#!/bin/bash
# scripts/deploy.sh

set -e  # 에러 시 중단

echo "🚀 FlavorNote 배포 시작..."

# 타입 체크
echo "📝 TypeScript 타입 체크..."
npm run type-check

# 린트 검사
echo "🔍 ESLint 검사..."
npm run lint

# 테스트 실행
echo "🧪 테스트 실행..."
npm run test

# 빌드
echo "🔨 프로덕션 빌드..."
npm run build

# Docker 이미지 빌드
echo "🐳 Docker 이미지 빌드..."
docker-compose build

# 서비스 재시작
echo "♻️ 서비스 재시작..."
docker-compose down
docker-compose up -d

echo "✅ 배포 완료!"
```

## 📊 성능 최적화 규칙

### Next.js 최적화
```typescript
// 이미지 최적화
import Image from 'next/image';

<Image
  src="/restaurant.jpg"
  alt="Restaurant"
  width={400}
  height={300}
  priority={false}  // LCP 이미지만 true
  placeholder="blur"
/>

// 동적 import로 코드 스플리팅
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false  // 클라이언트에서만 렌더링
});

// API 라우트 캐싱
export async function GET() {
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  });
}
```

### 데이터베이스 최적화
```typescript
// 1. 필요한 필드만 선택
const users = await prisma.user.findMany({
  select: {
    id: true,
    nickname: true,
    // email은 제외
  }
});

// 2. 관계 데이터 include로 N+1 문제 해결
const reviews = await prisma.review.findMany({
  include: {
    user: {
      select: { nickname: true }
    },
    tags: true
  }
});

// 3. 페이지네이션
const reviews = await prisma.review.findMany({
  skip: page * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});
```

## 🔧 개발 환경 설정

### VS Code 설정 (.vscode/settings.json)
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### 추천 VS Code 확장
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "Prisma.prisma"
  ]
}
```

## 📋 코드 리뷰 체크리스트

### 필수 검증 항목
- [ ] TypeScript 타입 체크 통과
- [ ] ESLint 규칙 준수
- [ ] 테스트 코드 작성 및 통과
- [ ] 보안 취약점 검토
- [ ] 성능 영향 검토
- [ ] 접근성 고려사항 검토
- [ ] 모바일 반응형 확인

### 코드 품질 기준
- [ ] 함수는 단일 책임 원칙 준수
- [ ] 컴포넌트는 100줄 이하 권장
- [ ] any 타입 사용 금지
- [ ] console.log 제거
- [ ] 주석은 "왜"를 설명 (what이 아닌)
- [ ] 매직 넘버 상수화

## 🚨 트러블슈팅 가이드

### 일반적인 문제 해결
```bash
# TypeScript 캐시 문제
rm -rf .next/
npm run dev

# 의존성 문제
rm -rf node_modules package-lock.json
npm install

# Prisma 스키마 동기화 문제
npx prisma generate
npx prisma db push

# 포트 충돌 문제
lsof -ti:3000 | xargs kill -9
```

### 로그 레벨 설정
```typescript
// lib/logger.ts
const logLevel = process.env.NODE_ENV === 'production' ? 'error' : 'debug';

export const logger = {
  debug: (message: string, data?: any) => {
    if (logLevel === 'debug') console.log(message, data);
  },
  error: (message: string, error?: Error) => {
    console.error(message, error);
  }
};
```

## 📈 모니터링 및 분석

### 성능 모니터링
```typescript
// lib/analytics.ts
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined') {
    // Google Analytics 또는 기타 분석 도구
  }
};

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // 이벤트 추적
  }
};
```

### 에러 추적
```typescript
// lib/error-tracking.ts
export const captureException = (error: Error, context?: any) => {
  console.error('Error:', error, context);
  // Sentry 또는 기타 에러 추적 서비스
};
```

---

## 🎯 개발 완료 기준

각 기능 개발 완료 시 다음 명령어들이 모두 성공해야 합니다:

```bash
npm run type-check  # TypeScript 타입 체크
npm run lint       # ESLint 검사
npm run test       # 테스트 실행
npm run build      # 프로덕션 빌드
```

**모든 규칙을 준수하여 안정적이고 유지보수 가능한 코드를 작성합시다!** 🚀