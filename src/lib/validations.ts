import { z } from 'zod';

// Phase 1 Validation Schemas

// User Authentication Schemas
export const createUserSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  nickname: z.string()
    .min(2, '닉네임은 2글자 이상이어야 합니다')
    .max(20, '닉네임은 20글자를 초과할 수 없습니다'),
  password: z.string()
    .min(8, '비밀번호는 8글자 이상이어야 합니다')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '비밀번호는 영문과 숫자를 포함해야 합니다'),
});

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

// Phase 1 Review Schemas
export const createReviewSchema = z.object({
  restaurantName: z.string()
    .min(1, '식당 이름을 입력해주세요')
    .max(255, '식당 이름이 너무 깁니다')
    .trim(),
  address: z.string()
    .max(500, '주소가 너무 깁니다')
    .trim()
    .transform(val => val || undefined)
    .optional(),
  content: z.string()
    .min(10, '리뷰는 10글자 이상 작성해주세요')
    .max(5000, '리뷰가 너무 깁니다')
    .trim(),
  willRevisit: z.boolean(),
});

export const updateReviewSchema = createReviewSchema;

// Phase 1 Wishlist Schemas
export const createWishlistSchema = z.object({
  restaurantName: z.string()
    .min(1, '식당명을 입력해주세요')
    .max(255, '식당명이 너무 깁니다')
    .trim(),
  address: z.string()
    .max(500, '주소가 너무 깁니다')
    .trim()
    .transform(val => val || undefined)
    .optional(),
  memo: z.string()
    .max(1000, '메모가 너무 깁니다')
    .trim()
    .transform(val => val || undefined)
    .optional(),
});

export const updateWishlistSchema = createWishlistSchema;

// Query parameter schemas
export const wishlistQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'restaurantName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type CreateWishlistInput = z.infer<typeof createWishlistSchema>;
export type UpdateWishlistInput = z.infer<typeof updateWishlistSchema>;
export type WishlistQueryParams = z.infer<typeof wishlistQuerySchema>;
export type ReviewQueryParams = z.infer<typeof reviewQuerySchema>;