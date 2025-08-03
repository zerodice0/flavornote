# FlavorNote PRD - Phase 1.6: 통합 테스트 및 배포 준비

## 🎯 목표
Phase 1의 모든 기능을 통합하고 품질 검증을 통해 프로덕션 배포 가능한 상태로 완성합니다.

## 📋 구현 범위

### ✅ 포함 기능

#### 1. 통합 테스트
- **E2E 테스트**: 사용자 여정 전체 시나리오 테스트
- **API 테스트**: 모든 API 엔드포인트 검증
- **컴포넌트 테스트**: 주요 React 컴포넌트 단위 테스트
- **인증 플로우 테스트**: 로그인/로그아웃 시나리오

#### 2. 성능 최적화
- **번들 분석**: 불필요한 의존성 제거
- **이미지 최적화**: Next.js Image 컴포넌트 적용
- **코드 스플리팅**: 라우트별 lazy loading
- **캐싱 전략**: React Query 캐시 최적화

#### 3. 보안 강화
- **입력 검증**: 모든 사용자 입력 서버사이드 검증
- **JWT 토큰 보안**: 토큰 만료 및 갱신 로직
- **CORS 설정**: 적절한 CORS 정책 적용
- **Rate Limiting**: API 요청 제한

#### 4. 배포 준비
- **Docker 구성**: 프로덕션용 Docker 설정
- **환경 변수**: 민감한 정보 환경 변수 분리
- **헬스 체크**: 애플리케이션 상태 모니터링
- **로깅 시스템**: 에러 추적 및 모니터링

### ❌ 제외 기능
- CI/CD 파이프라인
- 모니터링 대시보드
- 백업 자동화
- SSL 인증서 자동 갱신

## 🧪 테스트 구현

### E2E 테스트 시나리오
```typescript
// tests/e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('사용자 핵심 여정', () => {
  test('회원가입부터 리뷰 작성까지', async ({ page }) => {
    // 1. 회원가입
    await page.goto('/auth/register');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=nickname]', '테스트유저');
    await page.fill('[data-testid=password]', 'test1234');
    await page.click('[data-testid=register-button]');
    
    // 2. 홈 페이지 확인
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid=welcome-message]')).toContainText('테스트유저');
    
    // 3. 위시리스트 추가
    await page.click('[data-testid=add-wishlist-button]');
    await page.fill('[data-testid=restaurant-name]', '맛있는 식당');
    await page.fill('[data-testid=address]', '서울시 강남구');
    await page.fill('[data-testid=memo]', '꼭 가보고 싶은 곳');
    await page.click('[data-testid=submit-button]');
    
    // 4. 위시리스트 확인
    await page.goto('/wishlist');
    await expect(page.locator('[data-testid=wishlist-item]')).toContainText('맛있는 식당');
    
    // 5. 리뷰 작성
    await page.goto('/reviews/add');
    await page.fill('[data-testid=restaurant-name]', '다녀온 식당');
    await page.fill('[data-testid=content]', '정말 맛있었습니다. 다시 가고 싶어요.');
    await page.click('[data-testid=will-revisit-yes]');
    await page.click('[data-testid=submit-button]');
    
    // 6. 리뷰 확인
    await page.goto('/reviews');
    await expect(page.locator('[data-testid=review-item]')).toContainText('다녀온 식당');
    await expect(page.locator('[data-testid=will-revisit-badge]')).toContainText('또 가고 싶어요');
    
    // 7. 홈에서 통계 확인
    await page.goto('/');
    await expect(page.locator('[data-testid=reviews-count]')).toContainText('1');
    await expect(page.locator('[data-testid=wishlists-count]')).toContainText('1');
    await expect(page.locator('[data-testid=revisit-rate]')).toContainText('100%');
  });
  
  test('인증이 필요한 페이지 접근 제어', async ({ page }) => {
    // 로그인 없이 메인 페이지 접근 시 로그인 페이지로 리다이렉트
    await page.goto('/');
    await expect(page).toHaveURL('/auth/login');
    
    await page.goto('/wishlist');
    await expect(page).toHaveURL('/auth/login');
    
    await page.goto('/reviews');
    await expect(page).toHaveURL('/auth/login');
    
    await page.goto('/profile');
    await expect(page).toHaveURL('/auth/login');
  });
});
```

### API 테스트
```typescript
// tests/api/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';

describe('/api/auth', () => {
  describe('POST /api/auth/register', () => {
    it('올바른 데이터로 회원가입 성공', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          nickname: '테스트유저',
          password: 'test1234',
        },
      });
      
      const response = await registerHandler(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('test@example.com');
      expect(data.data.token).toBeDefined();
    });
    
    it('이메일 중복 시 실패', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com', // 이미 존재하는 이메일
          nickname: '다른유저',
          password: 'test1234',
        },
      });
      
      const response = await registerHandler(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('이미 사용 중인 이메일');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('올바른 인증 정보로 로그인 성공', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'test1234',
        },
      });
      
      const response = await loginHandler(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
    });
    
    it('잘못된 비밀번호로 로그인 실패', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });
      
      const response = await loginHandler(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });
});
```

### React 컴포넌트 테스트
```typescript
// tests/components/ReviewCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewCard } from '@/components/features/review/ReviewCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockReview = {
  id: '1',
  restaurantName: '테스트 식당',
  address: '서울시 테스트구',
  content: '맛있었습니다.',
  willRevisit: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const renderWithQuery = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ReviewCard', () => {
  it('리뷰 정보를 올바르게 표시', () => {
    renderWithQuery(<ReviewCard review={mockReview} />);
    
    expect(screen.getByText('테스트 식당')).toBeInTheDocument();
    expect(screen.getByText('서울시 테스트구')).toBeInTheDocument();
    expect(screen.getByText('맛있었습니다.')).toBeInTheDocument();
    expect(screen.getByText('또 가고 싶어요')).toBeInTheDocument();
  });
  
  it('수정 버튼 클릭 시 onEdit 콜백 호출', () => {
    const onEdit = jest.fn();
    renderWithQuery(
      <ReviewCard review={mockReview} onEdit={onEdit} />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockReview);
  });
  
  it('삭제 버튼 클릭 시 확인 후 onDelete 콜백 호출', async () => {
    const onDelete = jest.fn();
    global.confirm = jest.fn(() => true);
    
    renderWithQuery(
      <ReviewCard review={mockReview} onDelete={onDelete} />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('1');
    });
  });
});
```

## ⚡ 성능 최적화

### 번들 분석 및 최적화
```typescript
// next.config.js 업데이트
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 번들 분석
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  
  // 이미지 최적화
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 압축 설정
  compress: true,
  
  // 실험적 기능
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
```

### React Query 캐싱 최적화
```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 staleTime 설정
      staleTime: 1000 * 60 * 5, // 5분
      // 캐시 시간 설정
      cacheTime: 1000 * 60 * 30, // 30분
      // 백그라운드에서 자동 갱신
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      // 에러 재시도 설정
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      // 뮤테이션 재시도 설정
      retry: false,
    },
  },
});

// 프리패치 전략
export const prefetchHomeData = async (token: string) => {
  await queryClient.prefetchQuery({
    queryKey: ['home-data'],
    queryFn: () => fetch('/api/home', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json()),
  });
};
```

## 🔒 보안 강화

### 입력 검증 미들웨어
```typescript
// src/lib/validation-middleware.ts
import { z } from 'zod';

export function withValidation<T extends z.ZodSchema>(schema: T) {
  return function (handler: (request: Request, validatedData: z.infer<T>) => Promise<Response>) {
    return async function (request: Request, context?: any) {
      try {
        const body = await request.json();
        const validatedData = schema.parse(body);
        return handler(request, validatedData);
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
        throw error;
      }
    };
  };
}
```

### Rate Limiting 구현
```typescript
// src/lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options: Options = {}) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// API 라우트에서 사용
const limiter = rateLimit({
  interval: 60 * 1000, // 1분
  uniqueTokenPerInterval: 500,
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    await limiter.check(10, ip); // 분당 10회 제한
    
    // 실제 로직...
  } catch {
    return Response.json(
      { success: false, error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
      { status: 429 }
    );
  }
}
```

## 🐳 배포 설정

### 프로덕션 Dockerfile
```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose 프로덕션 구성
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### 헬스 체크 API
```typescript
// src/app/api/health/route.ts
export async function GET() {
  try {
    // 데이터베이스 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

## 📋 구현 체크리스트

### 테스트 구현
- [ ] E2E 테스트 시나리오 작성
- [ ] API 엔드포인트 테스트
- [ ] React 컴포넌트 단위 테스트
- [ ] 인증 플로우 테스트
- [ ] 테스트 커버리지 80% 이상

### 성능 최적화
- [ ] 번들 크기 분석 및 최적화
- [ ] 이미지 최적화 적용
- [ ] React Query 캐싱 전략
- [ ] 코드 스플리팅 구현
- [ ] 로딩 성능 측정

### 보안 강화
- [ ] 모든 API 입력 검증
- [ ] Rate Limiting 적용
- [ ] JWT 토큰 보안 설정
- [ ] CORS 정책 설정
- [ ] 보안 헤더 설정

### 배포 준비
- [ ] 프로덕션 Docker 설정
- [ ] 환경 변수 분리
- [ ] 헬스 체크 구현
- [ ] 로깅 시스템 설정
- [ ] 데이터베이스 마이그레이션 전략

### 문서화
- [ ] API 문서 정리
- [ ] 배포 가이드 작성
- [ ] 트러블슈팅 가이드
- [ ] 성능 모니터링 가이드

## 🎯 완료 조건

1. **모든 테스트 통과**: E2E, API, 컴포넌트 테스트 100% 통과
2. **성능 기준 충족**: Lighthouse 점수 90점 이상
3. **보안 검증**: 취약점 스캔 통과
4. **배포 성공**: 프로덕션 환경에서 정상 동작

## 🚀 다음 단계 (Phase 2)

Phase 1 완성 후 소셜 기능과 고급 기능을 추가하는 Phase 2를 시작합니다.