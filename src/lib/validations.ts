import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  nickname: z.string().min(2, '닉네임은 2글자 이상이어야 합니다').max(20, '닉네임은 20글자를 초과할 수 없습니다'),
  password: z.string().min(8, '비밀번호는 8글자 이상이어야 합니다'),
});

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const createRestaurantSchema = z.object({
  name: z.string().min(1, '식당 이름을 입력해주세요').max(255, '식당 이름이 너무 깁니다'),
  address: z.string().optional(),
  category: z.string().optional(),
  priceRange: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createReviewSchema = z.object({
  content: z.string().min(10, '리뷰는 10글자 이상 작성해주세요').max(5000, '리뷰가 너무 깁니다'),
  willRevisit: z.boolean(),
  tip: z.string().optional(),
  visitDate: z.string().optional(),
  images: z.array(z.string()).optional(),
  menuReviews: z.array(z.object({
    menuName: z.string(),
    description: z.string().optional(),
    rating: z.number().min(1).max(5),
    price: z.number().optional(),
  })).optional(),
});

export const createWishlistSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요').max(1000, '댓글이 너무 깁니다'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateWishlistInput = z.infer<typeof createWishlistSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;