export const API_ENDPOINTS = {
  USERS: '/api/users',
  REVIEWS: '/api/reviews',
  RESTAURANTS: '/api/restaurants',
  WISHLISTS: '/api/wishlists',
  COMMENTS: '/api/comments',
  FOLLOWS: '/api/follows',
} as const;

export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const PRIORITY_LABELS = {
  [PRIORITY_LEVELS.HIGH]: '🔥 꼭 가봐야 함',
  [PRIORITY_LEVELS.MEDIUM]: '⭐ 기회되면',
  [PRIORITY_LEVELS.LOW]: '📝 나중에',
} as const;

export const RESTAURANT_CATEGORIES = [
  '한식',
  '일식',
  '중식',
  '양식',
  '카페',
  '디저트',
  '분식',
  '치킨',
  '피자',
  '아시안',
  '기타',
] as const;

export const PRICE_RANGES = [
  '1만원 이하',
  '1-2만원',
  '2-3만원',
  '3-5만원',
  '5만원 이상',
] as const;

export const WISHLIST_TAGS = [
  '데이트',
  '혼밥',
  '회식',
  '가족식사',
  '친구모임',
  '기념일',
  '비즈니스',
  '카페타임',
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;