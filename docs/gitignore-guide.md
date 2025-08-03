# FlavorNote .gitignore 가이드

## 📋 포함되어야 하는 내용 (Version Control에 추가)

### ✅ 소스 코드
- `src/` - 모든 TypeScript/React 소스 코드
- `components/`, `lib/`, `hooks/`, `types/` - 핵심 애플리케이션 코드
- API 라우트, 페이지 컴포넌트

### ✅ 설정 파일
- `package.json`, `package-lock.json` - 의존성 정보
- `tsconfig.json` - TypeScript 설정
- `.eslintrc.json`, `.prettierrc` - 코드 품질 도구
- `tailwind.config.ts`, `postcss.config.mjs` - 스타일 설정
- `jest.config.js`, `jest.setup.js` - 테스트 설정
- `next.config.ts` - Next.js 설정

### ✅ 데이터베이스 스키마
- `prisma/schema.prisma` - 데이터베이스 스키마 정의
- `prisma/migrations/` - 데이터베이스 마이그레이션 파일
- `prisma/seed.ts` - 초기 데이터 시드 스크립트

### ✅ 공용 자산
- `public/` - 정적 파일 (아이콘, 기본 이미지)
- `favicon.ico` - 사이트 아이콘
- 기본 로고, UI 아이콘들

### ✅ 문서 및 설정
- `README.md` - 프로젝트 설명서
- `CLAUDE.md` - 개발 가이드라인
- `docs/` - 프로젝트 문서들
- `.gitignore` - Git 무시 파일 목록
- `.env.example` - 환경 변수 템플릿

### ✅ Docker 및 배포
- `Dockerfile` - Docker 이미지 빌드 설정
- `docker-compose.yml` - 컨테이너 오케스트레이션
- `docker/` - Docker 관련 설정 파일들
- `scripts/` - 배포 및 유틸리티 스크립트

### ✅ 개발 도구
- `.husky/` - Git hooks 설정
- `__tests__/` - 테스트 파일들
- `.vscode/extensions.json` - 권장 VS Code 확장

---

## ❌ 포함되면 안 되는 내용 (Version Control에서 제외)

### ❌ 민감한 정보
- `.env.local`, `.env.production` - 실제 환경 변수
- `*.key`, `*.pem`, `*.crt` - 인증서 및 키 파일
- `config/secrets.json` - 비밀 설정 파일
- `/ssl/`, `/certificates/` - SSL 인증서

### ❌ 자동 생성 파일
- `node_modules/` - 패키지 의존성
- `/.next/` - Next.js 빌드 결과
- `/build/`, `/dist/` - 빌드 산출물
- `*.tsbuildinfo` - TypeScript 컴파일 캐시

### ❌ 개발 환경 파일
- `.DS_Store`, `Thumbs.db` - OS 생성 파일
- `.vscode/settings.json` - 개인 IDE 설정
- `*.log` - 로그 파일
- `/coverage/` - 테스트 커버리지 리포트

### ❌ 사용자 업로드 데이터
- `/uploads/` - 사용자 업로드 파일
- `/public/images/restaurants/user-*` - 사용자 업로드 식당 이미지
- `/public/images/reviews/user-*` - 사용자 업로드 리뷰 이미지
- `/storage/` - 파일 저장소

### ❌ 데이터베이스 파일
- `*.db`, `*.sqlite` - SQLite 데이터베이스 파일
- `/prisma/dev.db*` - 개발용 DB 파일
- `/postgres-data/` - PostgreSQL 데이터 디렉토리

---

## 🔧 특별 케이스 처리

### 1. 환경 변수 관리
```bash
# 포함: 템플릿 파일
.env.example ✅

# 제외: 실제 환경 변수
.env.local ❌
.env.production ❌
.env.development ❌
```

### 2. 이미지 파일 관리
```bash
# 포함: 기본 UI 자산
public/logo.png ✅
public/icons/ ✅

# 제외: 사용자 업로드
public/uploads/ ❌
public/images/restaurants/user-123.jpg ❌
```

### 3. 데이터베이스 관리
```bash
# 포함: 스키마와 마이그레이션
prisma/schema.prisma ✅
prisma/migrations/ ✅

# 제외: 실제 데이터베이스 파일
prisma/dev.db ❌
prisma/data/ ❌
```

### 4. IDE 설정 관리
```bash
# 포함: 프로젝트 공통 설정
.vscode/extensions.json ✅

# 제외: 개인별 설정
.vscode/settings.json ❌
.vscode/launch.json ❌
```

---

## ⚠️ 주의사항

### 1. 민감 정보 유출 방지
- 환경 변수에 API 키, 데이터베이스 비밀번호 저장 금지
- 커밋 전 `git status`로 민감 파일 포함 여부 확인
- `.env.example`에는 실제 값 대신 예시 값만 포함

### 2. 용량 관리
- 대용량 파일 (이미지, 비디오) 직접 커밋 금지
- 사용자 업로드 파일은 별도 저장소 사용
- node_modules는 항상 제외

### 3. 개발 환경 일관성
- 개인별 IDE 설정은 제외하여 환경 차이 방지
- 공통 개발 도구 설정만 포함
- 팀 전체가 동일한 코드 스타일 유지

---

## 📝 .gitignore 수정 가이드

### 새로운 파일 타입 추가 시
1. 파일의 성격 파악 (소스코드/설정/생성물/민감정보)
2. 팀 전체에 공유 필요 여부 확인
3. 적절한 섹션에 패턴 추가

### 예시
```bash
# 새로운 분석 도구 결과 제외
/performance-reports/
*.perf.json

# 새로운 설정 파일 포함
custom-config.yml
```

### 검증 방법
```bash
# 특정 파일이 무시되는지 확인
git check-ignore 파일명

# 현재 추적 상태 확인
git status
```

---

이 가이드를 통해 FlavorNote 프로젝트의 버전 관리를 효율적이고 안전하게 수행할 수 있습니다.