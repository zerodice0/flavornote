import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth-middleware';
import { 
  createReviewSchema, 
  reviewQuerySchema,
  type CreateReviewInput 
} from '@/lib/validations';

/**
 * GET /api/reviews - Retrieve user's reviews with sorting and pagination
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 * - sortBy: Sort field (createdAt | updatedAt | restaurantName, default: createdAt)
 * - sortOrder: Sort direction (asc | desc, default: desc)
 * 
 * Features:
 * - User authentication required
 * - User can only see their own reviews
 * - Sorting by date or restaurant name
 * - Pagination with metadata
 * - Input validation and sanitization
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authMiddleware(request);
    if (user instanceof Response) {
      return user;
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    let queryParams;
    
    try {
      queryParams = reviewQuerySchema.parse({
        page: searchParams.get('page'),
        limit: searchParams.get('limit'),
        sortBy: searchParams.get('sortBy'),
        sortOrder: searchParams.get('sortOrder'),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          { 
            success: false, 
            error: '잘못된 쿼리 파라미터입니다.',
            details: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            }))
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { page, limit, sortBy, sortOrder } = queryParams;
    const skip = (page - 1) * limit;

    // Build sort object
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (sortBy === 'restaurantName') {
      // For Korean alphabetical sorting
      orderBy.restaurantName = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Execute queries in parallel for better performance
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { 
          userId: user.userId 
        },
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          restaurantName: true,
          address: true,
          content: true,
          willRevisit: true,
          createdAt: true,
          updatedAt: true,
          // Don't include userId in response for security
        },
      }),
      prisma.review.count({
        where: { 
          userId: user.userId 
        },
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    console.log(`Retrieved ${reviews.length} reviews for user ${user.userId}, page ${page}/${totalPages}`);

    return Response.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
        meta: {
          sortBy,
          sortOrder,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return Response.json(
      { 
        success: false, 
        error: '리뷰를 불러오는데 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews - Create a new review
 * 
 * Request Body:
 * - restaurantName: string (required, 1-255 chars)
 * - address: string (optional, max 500 chars)
 * - content: string (required, 10-5000 chars)
 * - willRevisit: boolean (required)
 * 
 * Features:
 * - User authentication required
 * - Comprehensive input validation
 * - Sanitization and trimming
 * - Ownership assignment to authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authMiddleware(request);
    if (user instanceof Response) {
      return user;
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, error: '잘못된 JSON 형식입니다.' },
        { status: 400 }
      );
    }

    // Validate input data
    let validatedData: CreateReviewInput;
    try {
      validatedData = createReviewSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          { 
            success: false, 
            error: '입력 데이터가 올바르지 않습니다.', 
            details: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            }))
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Create review with user ownership
    const review = await prisma.review.create({
      data: {
        restaurantName: validatedData.restaurantName,
        address: validatedData.address || null,
        content: validatedData.content,
        willRevisit: validatedData.willRevisit,
        userId: user.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        restaurantName: true,
        address: true,
        content: true,
        willRevisit: true,
        createdAt: true,
        updatedAt: true,
        // Don't include userId in response
      },
    });

    console.log(`Created review for restaurant "${review.restaurantName}" by user ${user.userId}`);

    return Response.json(
      {
        success: true,
        data: review,
        message: '리뷰가 성공적으로 작성되었습니다.',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating review:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return Response.json(
          { success: false, error: '이미 같은 리뷰가 존재합니다.' },
          { status: 409 }
        );
      }
    }

    return Response.json(
      { 
        success: false, 
        error: '리뷰 작성에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}