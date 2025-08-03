# FlavorNote PRD - Phase 3: 소셜 기능 구현

## 🎯 Phase 3 목표

**소셜 네트워킹 기능**을 구현하여 사용자들이 맛집 경험을 공유하고 소통할 수 있는 커뮤니티를 구축합니다.

### 성공 기준
- [ ] 사용자가 다른 사용자를 팔로우하고 피드를 볼 수 있다
- [ ] 후기에 댓글과 리액션을 달 수 있다
- [ ] 다른 사용자의 후기를 내 위시리스트에 저장할 수 있다
- [ ] 실시간 알림을 받을 수 있다
- [ ] SNS에 후기를 공유할 수 있다

## 📋 구현 범위

### ✅ 새로 추가되는 기능

#### 1. 팔로우 시스템
- **팔로우/언팔로우**: 사용자 간 팔로우 관계
- **팔로워/팔로잉 목록**: 관계 목록 조회
- **상호 팔로우**: 맞팔로우 상태 표시
- **팔로우 추천**: 맛집 취향 기반 사용자 추천

#### 2. 댓글 및 리액션
- **댓글 작성**: 후기에 댓글 달기
- **댓글 답글**: 댓글에 대한 답글
- **리액션**: 좋아요, 가고싶어요, 별로예요
- **댓글 신고**: 부적절한 댓글 신고 기능

#### 3. 피드 시스템
- **팔로우 피드**: 팔로우한 사용자들의 최신 후기
- **추천 피드**: 취향 기반 추천 후기
- **지역 피드**: 현재 위치 기반 주변 후기
- **피드 필터링**: 태그별, 지역별 필터

#### 4. 저장 기능
- **위시리스트 저장**: 다른 사용자 후기를 내 위시리스트에 추가
- **컬렉션**: 주제별로 저장된 후기 분류
- **공유 컬렉션**: 컬렉션을 다른 사용자와 공유

#### 5. 알림 시스템
- **실시간 알림**: 새 팔로워, 댓글, 리액션 알림
- **푸시 알림**: 앱 외부에서도 알림 수신
- **알림 설정**: 알림 유형별 on/off 설정
- **알림 히스토리**: 지난 알림 내역 조회

#### 6. SNS 공유
- **공유 템플릿**: 이미지 포함 카드 형태 템플릿
- **해시태그 자동 생성**: 태그 기반 해시태그 생성
- **플랫폼별 최적화**: 인스타그램, 트위터, 스레드 등
- **공유 통계**: 공유 횟수 및 반응 추적

## 🗄️ 데이터베이스 스키마 확장

### Follows 테이블 (신규)
```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

### Comments 테이블 (신규)
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 답글
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_review ON comments(review_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
```

### Reactions 테이블 (신규)
```sql
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'like', 'want_to_go', 'dislike'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, user_id, type)
);

CREATE INDEX idx_reactions_review ON reactions(review_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
```

### Collections 테이블 (신규)
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(collection_id, review_id)
);
```

### Notifications 테이블 (신규)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'follow', 'comment', 'reaction', 'mention'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- 관련 데이터 (review_id, comment_id 등)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
```

### Reports 테이블 (신규)
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL, -- 'review', 'comment'
  target_id UUID NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 기존 테이블 수정
```sql
-- Reviews 테이블에 통계 컬럼 추가
ALTER TABLE reviews ADD COLUMN comment_count INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN like_count INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN save_count INTEGER DEFAULT 0;

-- Users 테이블에 소셜 정보 추가
ALTER TABLE users ADD COLUMN follower_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN following_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN review_count INTEGER DEFAULT 0;
```

## 🛣️ API 설계 확장

### 팔로우 API
```typescript
POST   /api/users/[id]/follow     // 팔로우
DELETE /api/users/[id]/follow     // 언팔로우
GET    /api/users/[id]/followers  // 팔로워 목록
GET    /api/users/[id]/following  // 팔로잉 목록
GET    /api/users/suggestions     // 팔로우 추천
```

### 댓글 API
```typescript
GET    /api/reviews/[id]/comments         // 댓글 목록
POST   /api/reviews/[id]/comments         // 댓글 작성
PUT    /api/comments/[id]                 // 댓글 수정
DELETE /api/comments/[id]                 // 댓글 삭제
POST   /api/comments/[id]/reply           // 답글 작성
```

### 리액션 API
```typescript
POST   /api/reviews/[id]/reactions        // 리액션 추가
DELETE /api/reviews/[id]/reactions        // 리액션 제거
GET    /api/reviews/[id]/reactions        // 리액션 목록
```

### 피드 API
```typescript
GET /api/feed/following    // 팔로우 피드
GET /api/feed/discover     // 추천 피드
GET /api/feed/local        // 지역 피드
GET /api/feed/trending     // 인기 피드
```

### 컬렉션 API
```typescript
GET    /api/collections              // 내 컬렉션 목록
POST   /api/collections              // 컬렉션 생성
GET    /api/collections/[id]         // 컬렉션 상세
PUT    /api/collections/[id]         // 컬렉션 수정
DELETE /api/collections/[id]         // 컬렉션 삭제
POST   /api/collections/[id]/items   // 아이템 추가
DELETE /api/collections/[id]/items/[itemId] // 아이템 제거
```

### 알림 API
```typescript
GET    /api/notifications        // 알림 목록
PUT    /api/notifications/read   // 알림 읽음 처리
DELETE /api/notifications/[id]   // 알림 삭제
GET    /api/notifications/count  // 읽지 않은 알림 수
```

### 공유 API
```typescript
POST /api/reviews/[id]/share     // 공유 링크 생성
GET  /api/share/[shareId]        // 공유된 후기 조회
POST /api/share/template         // 공유 템플릿 생성
```

## 📱 새로운 페이지 및 컴포넌트

### 피드 페이지 개선
```typescript
// pages/feed/index.tsx - 통합 피드 페이지
interface FeedTab {
  id: 'following' | 'discover' | 'local' | 'trending';
  label: string;
  component: React.ComponentType;
}

// components/feed/FeedCard.tsx - 개선된 피드 카드
interface FeedCardProps {
  review: ReviewWithSocial;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onShare: () => void;
}
```

### 사용자 프로필 페이지
```typescript
// pages/users/[id].tsx - 다른 사용자 프로필
interface UserProfilePageProps {
  user: UserWithStats;
  isFollowing: boolean;
  canFollow: boolean;
}

// components/profile/FollowButton.tsx
interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onToggle: (isFollowing: boolean) => void;
}
```

### 댓글 시스템
```typescript
// components/comments/CommentSection.tsx
interface CommentSectionProps {
  reviewId: string;
  comments: CommentWithReplies[];
  onAddComment: (content: string, parentId?: string) => void;
}

// components/comments/CommentForm.tsx
interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}
```

### 알림 시스템
```typescript
// components/notifications/NotificationBell.tsx
interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

// components/notifications/NotificationList.tsx
interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}
```

### 컬렉션 관리
```typescript
// pages/collections/index.tsx - 컬렉션 목록
// pages/collections/[id].tsx - 컬렉션 상세
// components/collections/CollectionCard.tsx
interface CollectionCardProps {
  collection: Collection;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

## 🎨 UI/UX 개선사항

### 소셜 인터랙션
- **리액션 애니메이션**: 좋아요 버튼 애니메이션
- **댓글 스레드**: 답글 구조 시각화
- **실시간 업데이트**: 새 댓글/리액션 실시간 반영
- **소셜 증명**: 팔로워 수, 좋아요 수 표시

### 피드 경험
- **무한 스크롤**: 피드 자동 로딩
- **pull-to-refresh**: 당겨서 새로고침
- **스켈레톤 로딩**: 콘텐츠 로딩 중 플레이스홀더
- **이미지 레이지 로딩**: 성능 최적화

### 알림 UX
- **배지 표시**: 읽지 않은 알림 수 표시
- **그룹화**: 유사한 알림 묶음 표시
- **액션 버튼**: 알림에서 직접 액션 수행
- **시간 표시**: 상대적 시간 표시

## 🛠️ 기술 스택 추가

### 실시간 통신
- **Server-Sent Events (SSE)**: 실시간 알림
- **WebSocket** (선택사항): 실시간 댓글

### 이미지 최적화
- **next/image**: Next.js 이미지 최적화
- **placeholder blur**: 이미지 로딩 UX 개선

### 상태 관리
- **React Query/TanStack Query**: 서버 상태 관리
- **Zustand**: 클라이언트 상태 관리

### 푸시 알림
- **Web Push API**: 브라우저 푸시 알림
- **Service Worker**: 백그라운드 알림 처리

## 📋 개발 체크리스트

### 팔로우 시스템
- [ ] 팔로우 관계 데이터베이스 스키마
- [ ] 팔로우/언팔로우 API
- [ ] FollowButton 컴포넌트
- [ ] 팔로워/팔로잉 목록 페이지
- [ ] 팔로우 추천 알고리즘

### 댓글 시스템
- [ ] 댓글 데이터베이스 스키마
- [ ] 댓글 CRUD API
- [ ] CommentSection 컴포넌트
- [ ] 답글 기능
- [ ] 댓글 알림

### 리액션 시스템
- [ ] 리액션 데이터베이스 스키마
- [ ] 리액션 API
- [ ] 리액션 버튼 컴포넌트
- [ ] 리액션 카운트 표시
- [ ] 리액션 애니메이션

### 피드 시스템
- [ ] 피드 알고리즘 구현
- [ ] 피드 API 최적화
- [ ] 피드 페이지 리뉴얼
- [ ] 무한 스크롤 구현
- [ ] 피드 필터링

### 알림 시스템
- [ ] 알림 데이터베이스 스키마
- [ ] 알림 생성 로직
- [ ] 실시간 알림 전송
- [ ] 알림 UI 컴포넌트
- [ ] 푸시 알림 설정

### SNS 공유
- [ ] 공유 템플릿 생성 API
- [ ] 공유 링크 생성
- [ ] 플랫폼별 최적화
- [ ] 공유 통계 수집

### 성능 최적화
- [ ] 데이터베이스 인덱스 최적화
- [ ] API 응답 캐싱
- [ ] 이미지 레이지 로딩
- [ ] 번들 사이즈 최적화

## 🧪 테스트 계획

### 소셜 기능 테스트
- 대량 팔로우 관계 처리 테스트
- 댓글 스레드 깊이 테스트
- 실시간 알림 성능 테스트
- 동시 리액션 처리 테스트

### 보안 테스트
- 부적절한 콘텐츠 신고 테스트
- 스팸 댓글 방지 테스트
- 개인정보 노출 방지 테스트

### 성능 테스트
- 피드 로딩 성능 측정
- 실시간 알림 지연시간 측정
- 데이터베이스 쿼리 최적화 검증

## 📈 Phase 3 완료 후 목표

1. **커뮤니티 활성화**: 사용자 간 상호작용 증대
2. **콘텐츠 품질**: 양질의 후기 작성 유도
3. **사용자 유지**: 소셜 기능을 통한 리텐션 향상
4. **Phase 4 준비**: 고급 기능 및 최적화

## 🚀 Phase 4 예고

다음 단계에서는 고급 기능과 최적화에 집중할 예정입니다:
- 지도 연동 및 위치 기반 서비스
- AI 기반 맛집 추천
- 고급 통계 및 인사이트
- 성능 최적화 및 확장성 개선
- 관리자 도구 및 모더레이션