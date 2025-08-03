import { User, Restaurant, Review, Wishlist, Follow, Comment, MenuReview } from '@prisma/client';

export type {
  User,
  Restaurant,
  Review,
  Wishlist,
  Follow,
  Comment,
  MenuReview,
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ReviewWithDetails extends Review {
  user: {
    id: string;
    nickname: string;
  };
  restaurant: {
    id: string;
    name: string;
  };
  menuReviews: MenuReview[];
  comments: Array<Comment & {
    user: {
      id: string;
      nickname: string;
    };
  }>;
}

export interface WishlistWithDetails extends Wishlist {
  restaurant: Restaurant;
}

export interface UserProfile extends User {
  _count: {
    reviews: number;
    wishlists: number;
    followers: number;
    following: number;
  };
}