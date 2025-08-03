# FlavorNote 🍽️

개인의 맛집 경험을 체계적으로 기록하고 공유할 수 있는 식당 리뷰 플랫폼입니다.

## 🚀 기술 스택

### Core Stack
- **Frontend/Backend**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL
- **ORM**: Prisma 6.13.0
- **Styling**: Tailwind CSS 4
- **Authentication**: JWT (jose library)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript 5
- **Git Hooks**: Husky 9.1.7
- **Testing**: Jest 30 + Testing Library

## 🏗️ 프로젝트 구조

```
flavornote/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 인증 관련 페이지 그룹
│   │   └── api/               # API Routes
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   ├── forms/            # 폼 관련 컴포넌트
│   │   └── features/         # 기능별 컴포넌트
│   ├── lib/                   # 유틸리티 및 설정
│   ├── hooks/                 # 커스텀 React 훅
│   ├── types/                 # TypeScript 타입 정의
│   └── constants/             # 상수 정의
├── prisma/                    # Prisma 스키마 및 마이그레이션
├── __tests__/                 # 테스트 파일
├── docker/                    # Docker 설정 파일
├── docs/                      # 프로젝트 문서
└── scripts/                   # 빌드/배포 스크립트
```

## 🛠️ 개발 환경 설정

### 1. 환경 변수 설정
```bash
cp .env.example .env.local
```

### 2. 데이터베이스 설정
```bash
# PostgreSQL 데이터베이스 생성 후
npm run db:generate    # Prisma Client 생성
npm run db:push        # 스키마를 데이터베이스에 동기화
```

### 3. 개발 서버 실행
```bash
npm run dev
```

## 📝 개발 워크플로우

### 코드 작성 전
```bash
npm run type-check    # TypeScript 타입 체크
npm run lint         # ESLint 검사
npm run test         # 테스트 실행
```

### 커밋 전 (Husky로 자동화됨)
```bash
npm run validate     # 전체 검사 (타입체크 + 린트 + 테스트)
```

### 프로덕션 빌드
```bash
npm run build        # 프로덕션 빌드
npm start           # 프로덕션 서버 시작
```

## 🧪 테스트

```bash
npm run test         # 테스트 실행
npm run test:watch   # 테스트 감시 모드
```

## 🐳 Docker 배포

```bash
# 개발 환경
docker-compose up -d

# 프로덕션 배포
./scripts/deploy.sh
```

## 📚 주요 라이브러리

- **React 19.1.0** - UI 라이브러리
- **Next.js 15.4.5** - 풀스택 프레임워크
- **Prisma 6.13.0** - ORM
- **Jose 6.0.12** - JWT 인증
- **Zod 4.0.14** - 스키마 검증
- **Tailwind CSS 4** - 스타일링
- **Lucide React 0.536.0** - 아이콘

## 🔒 보안

- JWT 기반 인증
- TypeScript strict 모드
- 입력 검증 (Zod)
- ESLint 보안 규칙

## 📖 문서

- [프로젝트 명세서](./docs/project_specification.md)
- [개발 가이드라인](./CLAUDE.md)

## 🤝 기여하기

1. 코드 품질 기준을 준수해주세요
2. 모든 테스트가 통과해야 합니다
3. TypeScript strict 모드를 사용합니다
4. 커밋 전 `npm run validate`를 실행해주세요

---

**모든 규칙을 준수하여 안정적이고 유지보수 가능한 코드를 작성합시다!** 🚀