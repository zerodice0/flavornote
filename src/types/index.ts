// Phase 1 Models from Prisma
import { User, Review, Wishlist } from '@prisma/client';

export type {
  User,
  Review,
  Wishlist,
};

// API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Phase 1 Extended Types
export interface ReviewWithUser extends Review {
  user: {
    id: string;
    nickname: string;
  };
}

export interface WishlistWithUser extends Wishlist {
  user: {
    id: string;
    nickname: string;
  };
}

export interface UserProfile extends User {
  _count: {
    reviews: number;
    wishlists: number;
  };
}

// Form Data Types
export interface CreateUserInput {
  email: string;
  nickname: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateWishlistInput {
  restaurantName: string;
  address?: string;
  memo?: string;
}

export interface UpdateWishlistInput {
  restaurantName: string;
  address?: string;
  memo?: string;
}

export interface CreateReviewInput {
  restaurantName: string;
  address?: string;
  content: string;
  willRevisit: boolean;
}

export interface UpdateReviewInput {
  restaurantName: string;
  address?: string;
  content: string;
  willRevisit: boolean;
}

// Wishlist Query Parameters
export interface WishlistQueryParams {
  page: number;
  limit: number;
}