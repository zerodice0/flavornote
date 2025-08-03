# FlavorNote Phase 1 구현 계획서

## 📋 개요

FlavorNote Phase 1을 효율적으로 구현하기 위한 세부 실행 계획입니다. 각 단계별로 최적화된 프롬프트 명령어와 구현 가이드를 제공합니다.

## 🎯 Phase 1 전체 목표

- **기간**: 2-3주 예상
- **범위**: 핵심 CRUD 기능 (위시리스트, 리뷰) + 인증 + 기본 UI
- **완료 기준**: 개인 사용자가 맛집을 관리할 수 있는 MVP 완성

---

## 📊 구현 순서 및 프롬프트 명령어

### Phase 1.1: 기반 구조 구축 (1-2일)

**목표**: 레이아웃 시스템과 기본 UI 컴포넌트 완성

#### 🚀 최적화된 실행 명령어

```bash
# 1. 기본 UI 컴포넌트 확장
//sc:implement @docs/prd-phase1-1-foundation.md 기존 Button, Input 컴포넌트를 확장하여 variant, size, loading 상태를 지원하는 완전한 UI 컴포넌트로 개선해줘. --type component --framework react --magic

# 2. 레이아웃 시스템 구축
//sc:implement @docs/prd-phase1-1-foundation.md MainLayout, AuthLayout 컴포넌트와 하단 네비게이션을 포함한 전체 레이아웃 시스템을 구축해줘. Lucide React 아이콘을 사용하고 Next.js App Router 구조에 맞게 구성해줘. --type layout --framework nextjs --magic

# 3. 라우트 그룹 및 페이지 구조 설정
//sc:implement @docs/prd-phase1-1-foundation.md Next.js App Router의 (main), (auth) 라우트 그룹을 설정하고 6개 플레이스홀더 페이지(홈, 위시리스트, 리뷰, 프로필, 로그인, 회원가입)를 생성해줘. --type routing --framework nextjs

# 4. 공통 컴포넌트 구현
//sc:implement @docs/prd-phase1-1-foundation.md Loading, Modal, ErrorMessage 등 공통으로 사용할 유틸리티 컴포넌트들을 구현해줘. 재사용성과 접근성을 고려해서 만들어줘. --type component --framework react --focus accessibility --magic
```

#### ✅ 완료 기준

- [x] 하단 탭으로 페이지 간 이동 가능
- [x] 모든 페이지에서 일관된 레이아웃 표시
- [x] 모바일/데스크톱 반응형 동작
- [x] 기본 UI 컴포넌트 재사용 가능

---

### Phase 1.2: 데이터베이스 및 인증 시스템 (2-3일)

**목표**: JWT 기반 인증과 PostgreSQL 데이터베이스 연동

#### 🚀 최적화된 실행 명령어

```bash
# 1. Prisma 스키마 업데이트
/sc:implement @docs/prd-phase1-2-database-auth.md 기존 Prisma 스키마를 Phase 1용으로 간소화하여 User, Wishlist, Review 테이블만 포함하도록 수정하고 첫 번째 마이그레이션을 생성해줘. --type database --framework prisma --c7

# 2. 인증 API 구현
/sc:implement @docs/prd-phase1-2-database-auth.md JWT 기반 회원가입, 로그인 API를 구현해줘. bcryptjs로 비밀번호 해싱, Zod로 입력 검증, 적절한 에러 처리를 포함해서 만들어줘. --type api --framework nextjs --focus security --seq

# 3. React 인증 시스템 구현
/sc:implement @docs/prd-phase1-2-database-auth.md AuthContext와 AuthProvider를 사용한 React 인증 상태 관리 시스템을 구현해줘. localStorage 토큰 저장, 자동 로그인, AuthGuard 컴포넌트를 포함해줘. --type context --framework react --focus authentication --seq

# 4. 인증 폼 및 페이지 구현
/sc:implement @docs/prd-phase1-2-database-auth.md React Hook Form과 Zod 검증을 사용한 로그인/회원가입 폼을 구현하고, 인증 페이지들을 완성해줬. 에러 처리와 로딩 상태 표시를 포함해줘. --type form --framework react --focus validation --magic
```

#### ✅ 완료 기준

- [x] 회원가입/로그인 실제 동작
- [x] 새로고침 시에도 로그인 상태 유지
- [x] 인증 없이 메인 페이지 접근 시 로그인 페이지로 리다이렉트
- [x] 적절한 에러 메시지 표시

---

### Phase 1.3: 위시리스트 기능 구현 (2-3일)

**목표**: 가고싶은 식당 CRUD 기능 완성

#### 🚀 최적화된 실행 명령어

```bash
# 1. 위시리스트 API 구현
/sc:implement @docs/prd-phase1-3-wishlist.md 위시리스트 CRUD API (GET, POST, PUT, DELETE)를 구현해줘. 인증 미들웨어, 페이지네이션, Zod 검증, 소유권 확인을 포함하고 RESTful 원칙을 따라서 만들어줘. --type api --framework nextjs --focus crud --seq

# 2. 위시리스트 React 컴포넌트 구현
/sc:implement @docs/prd-phase1-3-wishlist.md WishlistCard, WishlistForm 컴포넌트를 구현해줘. React Hook Form, 삭제 확인 다이얼로그, 로딩 상태, 에러 처리를 포함해서 사용자 친화적으로 만들어줘. --type component --framework react --focus ux --magic

# 3. 위시리스트 데이터 관리 훅 구현
/sc:implement @docs/prd-phase1-3-wishlist.md useWishlists 훅을 React Query로 구현해줘. 캐싱, Optimistic Updates, 에러 처리, 데이터 동기화를 포함해서 성능 최적화에 집중해줘. --type hook --framework react --focus performance --seq

# 4. 위시리스트 페이지 완성
/sc:implement @docs/prd-phase1-3-wishlist.md 위시리스트 목록 페이지와 추가/수정 모달을 완성해줘. 빈 상태 처리, 페이지네이션, 성공/실패 토스트 메시지를 포함해서 완전한 사용자 경험을 제공해줘. --type page --framework react --focus ux --magic
```

#### ✅ 완료 기준

- [x] 위시리스트 생성, 조회, 수정, 삭제 모두 동작
- [x] 액션 후 즉시 UI 반영
- [x] 적절한 에러 메시지 및 로딩 상태 표시
- [x] 모바일에서 터치 친화적 인터페이스

---

### Phase 1.4: 리뷰 기능 구현 (2-3일)

**목표**: 식당 후기 CRUD 기능 완성 (재방문 의사 포함)

#### 🚀 최적화된 실행 명령어

```bash
# 1. 리뷰 API 구현
/sc:implement @docs/prd-phase1-4-reviews.md 리뷰 CRUD API를 구현해줘. 정렬(최신순, 가나다순), 페이지네이션, willRevisit 필드를 포함하고, 인증 및 소유권 검증을 철저히 해줘. --type api --framework nextjs --focus crud --seq

# 2. 리뷰 컴포넌트 구현
/sc:implement @docs/prd-phase1-4-reviews.md ReviewCard, ReviewForm, WillRevisitBadge 컴포넌트를 구현해줘. 재방문 의사 선택 UI, 시각적 구분, 날짜 표시를 포함해서 직관적으로 만들어줘. --type component --framework react --focus ui --magic

# 3. 리뷰 데이터 관리 시스템
/sc:implement @docs/prd-phase1-4-reviews.md useReviews 훅을 React Query로 구현해줘. 정렬, 필터링, 무한 스크롤 또는 페이지네이션, 캐시 무효화를 포함해서 효율적으로 만들어줘. --type hook --framework react --focus data-management --seq

# 4. 리뷰 페이지 및 폼 완성
/sc:implement @docs/prd-phase1-4-reviews.md 리뷰 목록 페이지, 작성/수정 모달을 완성해줘. 재방문 의사 라디오 버튼, 정렬 기능, 반응형 디자인을 포함해서 완전한 기능을 제공해줘. --type page --framework react --focus complete-feature --magic ✅
```

#### ✅ 완료 기준

- [x] 리뷰 작성, 조회, 수정, 삭제 모두 정상 동작
- [x] 재방문 의사 명확한 시각적 구분 및 선택 UI
- [x] 정렬 기능 (최신순, 가나다순) 동작
- [x] 모바일에서 긴 텍스트 적절히 표시

---

### Phase 1.5: 홈 페이지 및 프로필 페이지 (1-2일)

**목표**: 메인 대시보드와 사용자 정보 페이지 완성

#### 🚀 최적화된 실행 명령어

```bash
# 1. 홈 데이터 API 구현
/sc:implement @docs/prd-phase1-5-pages.md 홈 페이지용 대시보드 데이터 API를 구현해줘. 최근 리뷰 3개, 최근 위시리스트 3개, 통계(리뷰 수, 위시리스트 수, 재방문률)를 병렬로 조회하도록 최적화해줘. --type api --framework nextjs --focus aggregation --seq

# 2. 홈 페이지 컴포넌트 구현
/sc:implement @docs/prd-phase1-5-pages.md 홈 페이지의 WelcomeSection, QuickActions, StatsCard, RecentSection 컴포넌트들을 구현해줘. 개인화된 인사말, 빠른 액션 버튼, 통계 카드를 포함해서 대시보드 느낌으로 만들어줘. --type component --framework react --focus dashboard --magic

# 3. 프로필 페이지 구현
/sc:implement @docs/prd-phase1-5-pages.md 프로필 페이지를 구현해줘. 사용자 정보 표시, 활동 통계, 빠른 네비게이션, 로그아웃 기능을 포함해서 개인 정보 관리 페이지로 완성해줘. --type page --framework react --focus profile --magic

# 4. 홈 데이터 연동 및 최적화
/sc:implement @docs/prd-phase1-5-pages.md useHomeData, useUserStats 훅을 구현하고 React Query 캐싱 전략을 적용해줘. 실시간 동기화, 스켈레톤 로더, 에러 처리를 포함해서 성능 최적화해줘. --type hook --framework react --focus optimization --seq
```

#### ✅ 완료 기준

- [x] 사용자 데이터 기반 개인화된 홈 화면 표시
- [x] 프로필 페이지에서 사용자 정보와 통계 정확한 표시
- [x] 홈에서 다른 페이지로 원활한 이동
- [x] 다른 페이지에서 변경 시 홈 데이터 자동 갱신

---

### Phase 1.6: 통합 테스트 및 배포 준비 (2-3일)

**목표**: 품질 검증과 프로덕션 배포 준비

#### 🚀 최적화된 실행 명령어

```bash
# 1. E2E 테스트 구현
/sc:test @docs/prd-phase1-6-integration.md E2E 테스트 시나리오를 Playwright로 구현해줘. 회원가입부터 리뷰 작성까지 전체 사용자 여정, 인증 접근 제어, 에러 시나리오를 포함해서 완전히 검증해줘. --type e2e --framework playwright --focus user-journey --play

# 2. API 및 컴포넌트 테스트
/sc:test @docs/prd-phase1-6-integration.md 모든 API 엔드포인트와 주요 React 컴포넌트에 대한 단위 테스트를 Jest로 작성해줘. 인증, CRUD, 에러 처리, 사용자 인터랙션을 모두 커버해줘. --type unit --framework jest --focus coverage --seq

# 3. 성능 최적화
/sc:improve @docs/prd-phase1-6-integration.md 번들 크기 분석, React Query 캐싱 최적화, 이미지 최적화, 코드 스플리팅을 적용해서 로딩 성능을 개선해줘. Next.js 최적화 기법을 모두 활용해줘. --type performance --framework nextjs --focus optimization --seq

# 4. 보안 강화 및 배포 설정
/sc:implement @docs/prd-phase1-6-integration.md Rate Limiting, 입력 검증 강화, JWT 보안 설정을 적용하고, 프로덕션용 Docker 구성과 헬스 체크를 구현해줘. 보안과 운영을 고려해서 완성해줘. --type security --framework docker --focus production --seq
```

#### ✅ 완료 기준

- [x] 모든 테스트 통과 (E2E, API, 컴포넌트)
- [x] Lighthouse 점수 90점 이상
- [x] 보안 검증 통과
- [x] 프로덕션 환경에서 정상 동작

---

## 🛠️ 프롬프트 명령어 가이드

### 명령어 구조 설명

```bash
/sc:[command] @docs/prd-file.md [description] --type [type] --framework [framework] --focus [focus] --[mcp-server]
```

#### 주요 Commands

- `/sc:implement`: 새로운 기능 구현
- `/sc:improve`: 기존 코드 개선/최적화
- `/sc:test`: 테스트 코드 작성
- `/sc:analyze`: 코드 분석 및 리뷰

#### Type 옵션

- `component`: React 컴포넌트
- `api`: API 엔드포인트
- `hook`: React 커스텀 훅
- `page`: 페이지 컴포넌트
- `layout`: 레이아웃 컴포넌트
- `form`: 폼 관련 컴포넌트
- `database`: 데이터베이스 관련
- `security`: 보안 관련
- `performance`: 성능 최적화

#### Framework 옵션

- `nextjs`: Next.js 관련
- `react`: React 관련
- `prisma`: Prisma ORM 관련
- `playwright`: E2E 테스트
- `jest`: 단위 테스트

#### Focus 옵션

- `crud`: CRUD 기능
- `authentication`: 인증
- `validation`: 입력 검증
- `ux`: 사용자 경험
- `performance`: 성능
- `security`: 보안
- `accessibility`: 접근성

#### MCP Server 옵션

- `--magic`: UI 컴포넌트 생성 및 디자인 시스템
- `--seq`: 복잡한 분석 및 다단계 추론
- `--c7`: 라이브러리 문서 및 패턴 참조
- `--play`: 브라우저 자동화 및 E2E 테스트

---

## 📈 진행 상황 추적

### 체크리스트 템플릿

```markdown
## Phase 1.X 진행 상황

### 🎯 목표

- [ ] 목표 1
- [ ] 목표 2
- [ ] 목표 3

### 📋 세부 작업

- [ ] API 구현
- [ ] 컴포넌트 구현
- [ ] 페이지 구현
- [ ] 테스트 작성

### 🚨 이슈 및 해결

- [ ] 이슈 1: 해결 방법
- [ ] 이슈 2: 해결 방법

### ✅ 완료 기준 확인

- [ ] 기능 동작 확인
- [ ] 에러 처리 확인
- [ ] 반응형 확인
- [ ] 성능 확인
```

---

## 🎯 단계별 예상 소요 시간

| Phase | 예상 시간 | 주요 작업             | 난이도   |
| ----- | --------- | --------------------- | -------- |
| 1.1   | 1-2일     | UI 컴포넌트, 레이아웃 | ⭐⭐     |
| 1.2   | 2-3일     | 인증, DB 연동         | ⭐⭐⭐   |
| 1.3   | 2-3일     | 위시리스트 CRUD       | ⭐⭐⭐   |
| 1.4   | 2-3일     | 리뷰 CRUD             | ⭐⭐⭐   |
| 1.5   | 1-2일     | 홈, 프로필 페이지     | ⭐⭐     |
| 1.6   | 2-3일     | 테스트, 배포 준비     | ⭐⭐⭐⭐ |

**총 예상 기간**: 10-16일 (2-3주)

---

## 🚀 다음 단계 (Phase 2 준비)

Phase 1 완성 후 고려할 기능들:

### 우선순위 1 (Phase 2.1)

- 이미지 업로드 기능
- 검색 및 필터링
- 태그 시스템

### 우선순위 2 (Phase 2.2)

- 소셜 기능 (팔로우, 댓글)
- SNS 공유 기능
- 알림 시스템

### 우선순위 3 (Phase 2.3)

- 지도 연동
- 추천 시스템
- 통계 대시보드

---

## 💡 성공을 위한 팁

### 개발 효율성

1. **한 번에 하나씩**: 각 Phase를 완전히 완성 후 다음 단계 진행
2. **테스트 주도**: 기능 구현과 동시에 테스트 작성
3. **점진적 개선**: 완벽하지 않아도 동작하는 버전부터 만들기

### 코드 품질

1. **일관성 유지**: 기존 코드 스타일 및 패턴 따르기
2. **재사용성 고려**: 공통 컴포넌트와 훅 적극 활용
3. **에러 처리**: 모든 사용자 액션에 대한 피드백 제공

### 사용자 경험

1. **로딩 상태**: 모든 비동기 작업에 로딩 표시
2. **에러 메시지**: 명확하고 도움이 되는 에러 메시지
3. **반응형 디자인**: 모바일 우선으로 개발

### SuperClaude 명령어 사용법

1. **PRD 파일 참조**: 항상 해당 Phase의 PRD 문서를 `@docs/` 형식으로 참조
2. **MCP 서버 활용**: UI는 `--magic`, 복잡한 로직은 `--seq`, 문서는 `--c7`, 테스트는 `--play`
3. **명령어 조합**: 여러 플래그를 조합하여 최적의 결과 도출

## 🚀 빠른 시작 가이드

Phase 1.1부터 바로 시작하려면:

```bash
/sc:implement @docs/prd-phase1-1-foundation.md 기존 Button, Input 컴포넌트를 확장하여 variant, size, loading 상태를 지원하는 완전한 UI 컴포넌트로 개선해줘. --type component --framework react --magic
```

이 계획서를 따라 진행하면 체계적이고 효율적으로 FlavorNote Phase 1을 완성할 수 있습니다! 🚀
