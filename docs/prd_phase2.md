# FlavorNote PRD - Phase 2: 핵심 기능 강화

## 🎯 Phase 2 목표

Phase 1의 기본 기능을 바탕으로 **핵심 사용자 경험을 강화**하고 **차별화된 기능**을 추가합니다.

### 성공 기준
- [ ] 사용자가 이미지와 함께 생생한 후기를 작성할 수 있다
- [ ] 태그 시스템으로 체계적인 분류가 가능하다
- [ ] 검색을 통해 원하는 정보를 빠르게 찾을 수 있다
- [ ] 메뉴별 세부 리뷰로 더 상세한 정보를 제공할 수 있다
- [ ] 사용자별 설정으로 개인화된 경험을 제공할 수 있다

## 📋 구현 범위

### ✅ 새로 추가되는 기능

#### 1. 이미지 업로드 시스템
- **파일 업로드**: 이미지 파일 로컬 저장
- **이미지 최적화**: 자동 리사이징 및 압축
- **갤러리 뷰**: 이미지 슬라이더로 표시
- **다중 이미지**: 리뷰당 최대 5장

#### 2. 태그 시스템
- **카테고리 태그**: 미리 정의된 태그 (한식, 양식, 중식 등)
- **상황 태그**: 데이트, 혼밥, 회식, 가족모임 등
- **커스텀 태그**: 사용자 정의 태그
- **태그 자동완성**: 기존 태그 제안
- **태그 중복 방지**: 유사 태그 통합

#### 3. 검색 기능
- **통합 검색**: 식당명, 주소, 태그, 사용자 검색
- **필터링**: 태그별, 재방문 의사별, 작성일별
- **정렬**: 최신순, 인기순, 평점순
- **검색 기록**: 최근 검색어 저장

#### 4. 메뉴별 세부 리뷰
- **메뉴 추가**: 메뉴명, 가격, 간단한 평가
- **메뉴 사진**: 개별 메뉴 이미지
- **추천도**: 메뉴별 추천/비추천
- **동적 추가**: 리뷰 작성 중 메뉴 추가/삭제

#### 5. 사용자 설정
- **프로필 설정**: 닉네임, 프로필 이미지
- **공유 설정**: SNS 공유 기본값
- **알림 설정**: 푸시 알림 on/off
- **개인정보 설정**: 위치 공유 범위

### 🔄 기존 기능 개선
- **위시리스트**: 태그 추가, 이미지 추가
- **후기**: 이미지 업로드, 태그 추가, 메뉴 리뷰
- **홈 피드**: 이미지 포함 카드, 태그 필터
- **프로필**: 프로필 이미지, 상세 통계

## 🗄️ 데이터베이스 스키마 확장

### Images 테이블 (신규)
```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tags 테이블 (신규)
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'food', 'situation', 'custom'
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Menus 테이블 (신규)
```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price INTEGER,
  description TEXT,
  recommendation BOOLEAN, -- true: 추천, false: 비추천
  image_id UUID REFERENCES images(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 연결 테이블들 (신규)
```sql
-- 위시리스트-태그 연결
CREATE TABLE wishlist_tags (
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (wishlist_id, tag_id)
);

-- 리뷰-태그 연결
CREATE TABLE review_tags (
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (review_id, tag_id)
);

-- 리뷰-이미지 연결
CREATE TABLE review_images (
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,
  PRIMARY KEY (review_id, image_id)
);

-- 위시리스트-이미지 연결
CREATE TABLE wishlist_images (
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,
  PRIMARY KEY (wishlist_id, image_id)
);
```

### 기존 테이블 수정
```sql
-- Users 테이블에 프로필 이미지 추가
ALTER TABLE users ADD COLUMN profile_image_id UUID REFERENCES images(id);
ALTER TABLE users ADD COLUMN bio TEXT;

-- Wishlists 테이블에 예산 범위, 긴급도 추가
ALTER TABLE wishlists ADD COLUMN budget_min INTEGER;
ALTER TABLE wishlists ADD COLUMN budget_max INTEGER;
ALTER TABLE wishlists ADD COLUMN urgency VARCHAR(20) DEFAULT 'normal'; -- 'high', 'normal', 'low'

-- Reviews 테이블에 팁 정보 추가
ALTER TABLE reviews ADD COLUMN tips TEXT;
```

## 🛣️ API 설계 확장

### 이미지 API
```typescript
POST   /api/images/upload    // 이미지 업로드
GET    /api/images/[id]      // 이미지 조회
DELETE /api/images/[id]      // 이미지 삭제
```

### 태그 API
```typescript
GET    /api/tags             // 태그 목록 조회
POST   /api/tags             // 새 태그 생성
GET    /api/tags/search      // 태그 검색/자동완성
GET    /api/tags/popular     // 인기 태그 조회
```

### 검색 API
```typescript
GET /api/search?q={query}&type={type}&tags={tags}&sort={sort}
// type: 'all', 'restaurants', 'reviews', 'users'
// sort: 'latest', 'popular', 'rating'
```

### 메뉴 API
```typescript
POST   /api/reviews/[id]/menus     // 메뉴 추가
PUT    /api/reviews/[id]/menus/[menuId]  // 메뉴 수정
DELETE /api/reviews/[id]/menus/[menuId]  // 메뉴 삭제
```

## 📱 새로운 컴포넌트

### 이미지 관련
```typescript
// components/ui/ImageUploader.tsx
interface ImageUploaderProps {
  maxImages?: number;
  onImagesChange: (images: File[]) => void;
  existingImages?: string[];
}

// components/ui/ImageGallery.tsx
interface ImageGalleryProps {
  images: string[];
  onImageClick?: (index: number) => void;
  showDots?: boolean;
}
```

### 태그 관련
```typescript
// components/ui/TagSelector.tsx
interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  suggestions?: Tag[];
  allowCustom?: boolean;
}

// components/ui/TagChip.tsx
interface TagChipProps {
  tag: Tag;
  onRemove?: () => void;
  variant?: 'default' | 'removable' | 'clickable';
}
```

### 검색 관련
```typescript
// components/search/SearchFilters.tsx
interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

interface SearchFilters {
  tags: string[];
  dateRange?: [Date, Date];
  willRevisit?: boolean;
  sortBy: 'latest' | 'popular' | 'rating';
}
```

### 메뉴 관련
```typescript
// components/review/MenuReviewForm.tsx
interface MenuReviewFormProps {
  menus: MenuReview[];
  onMenusChange: (menus: MenuReview[]) => void;
}

interface MenuReview {
  id?: string;
  name: string;
  price?: number;
  description?: string;
  recommendation?: boolean;
  image?: File | string;
}
```

## 🎨 UI/UX 개선사항

### 이미지 처리
- **업로드 진행률**: 파일 업로드 시 진행 상황 표시
- **이미지 프리뷰**: 업로드 전 미리보기
- **오류 처리**: 파일 형식/크기 오류 메시지
- **로딩 상태**: 이미지 로딩 중 스켈레톤 UI

### 태그 UX
- **시각적 구분**: 카테고리별 태그 색상 구분
- **드래그앤드롭**: 태그 순서 변경
- **빠른 선택**: 자주 사용하는 태그 상단 노출
- **태그 제안**: 입력 중 실시간 자동완성

### 검색 경험
- **검색 결과 하이라이트**: 검색어 강조 표시
- **무한 스크롤**: 검색 결과 페이지네이션
- **검색 기록**: 최근 검색어 빠른 선택
- **필터 저장**: 자주 사용하는 필터 조합 저장

## 🛠️ 기술 스택 추가

### 이미지 처리
- **sharp**: 이미지 리사이징 및 최적화
- **multer**: 파일 업로드 미들웨어
- **image-size**: 이미지 메타데이터 추출

### 검색 기능
- **fuse.js**: 퍼지 검색 (선택사항)
- **PostgreSQL Full-Text Search**: 내장 검색 기능

### UI 라이브러리
- **react-image-gallery**: 이미지 슬라이더
- **react-select**: 태그 선택 컴포넌트
- **react-dropzone**: 파일 드래그앤드롭

## 📋 개발 체크리스트

### 이미지 시스템
- [ ] 이미지 업로드 API 구현
- [ ] 파일 저장 로직 구현
- [ ] 이미지 최적화 파이프라인
- [ ] ImageUploader 컴포넌트
- [ ] ImageGallery 컴포넌트
- [ ] 이미지 삭제 기능

### 태그 시스템
- [ ] 태그 데이터베이스 스키마
- [ ] 태그 CRUD API
- [ ] 태그 자동완성 API
- [ ] TagSelector 컴포넌트
- [ ] 태그 중복 방지 로직
- [ ] 기본 태그 데이터 추가

### 검색 기능
- [ ] 통합 검색 API
- [ ] 검색 필터링 로직
- [ ] 검색 결과 페이지
- [ ] 검색 기록 저장
- [ ] 자동완성 기능

### 메뉴 리뷰
- [ ] 메뉴 데이터베이스 스키마
- [ ] 메뉴 CRUD API
- [ ] MenuReviewForm 컴포넌트
- [ ] 메뉴별 이미지 업로드
- [ ] 동적 메뉴 추가/삭제

### 사용자 설정
- [ ] 설정 페이지 UI
- [ ] 프로필 이미지 업로드
- [ ] 설정 저장/불러오기 API
- [ ] 설정 검증 로직

### 기존 기능 개선
- [ ] 위시리스트에 태그/이미지 추가
- [ ] 후기에 태그/이미지/메뉴 추가
- [ ] 홈 피드 레이아웃 개선
- [ ] 카드 컴포넌트 업데이트

## 🧪 테스트 계획

### 이미지 업로드 테스트
- 다양한 파일 형식 테스트
- 큰 파일 처리 테스트
- 동시 업로드 테스트
- 저장소 용량 관리 테스트

### 태그 시스템 테스트
- 태그 중복 방지 테스트
- 대소문자 처리 테스트
- 특수문자 처리 테스트
- 태그 자동완성 성능 테스트

### 검색 성능 테스트
- 대용량 데이터 검색 테스트
- 복합 필터 성능 테스트
- 동시 검색 요청 테스트

## 📈 Phase 2 완료 후 목표

1. **사용자 만족도 조사**: 새 기능에 대한 피드백 수집
2. **성능 최적화**: 이미지 로딩 및 검색 성능 개선
3. **데이터 분석**: 태그 사용 패턴, 검색 패턴 분석
4. **Phase 3 준비**: 소셜 기능 설계

## 🚀 Phase 3 예고

다음 단계에서는 소셜 기능에 집중할 예정입니다:
- 사용자 팔로우 시스템
- 댓글 및 리액션
- 피드 알고리즘
- 소셜 알림
- 맛집 공유 및 추천