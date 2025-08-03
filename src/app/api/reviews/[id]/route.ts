import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth-middleware';
import { 
  updateReviewSchema,
  type UpdateReviewInput 
} from '@/lib/validations';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/reviews/[id] - Get a specific review by ID
 * 
 * Features:
 * - User authentication required
 * - Ownership verification (user can only access their own reviews)
 * - Returns 404 if review not found or not owned by user
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Authenticate user
    const user = await authMiddleware(request);
    if (user instanceof Response) {
      return user;
    }

    const { id } = await params;

    // Validate ID format (basic UUID validation)
    if (!id || typeof id !== 'string' || id.length < 1) {
      return Response.json(
        { success: false, error: '올바른 리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Find review with ownership check
    const review = await prisma.review.findFirst({
      where: { 
        id,
        userId: user.userId // Ownership verification
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

    if (!review) {
      return Response.json(
        { success: false, error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log(`Retrieved review ${id} for user ${user.userId}`);

    return Response.json({
      success: true,
      data: review,
    });

  } catch (error) {
    console.error('Error fetching review:', error);
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
 * PUT /api/reviews/[id] - Update a specific review
 * 
 * Request Body:
 * - restaurantName: string (required, 1-255 chars)
 * - address: string (optional, max 500 chars)
 * - content: string (required, 10-5000 chars)
 * - willRevisit: boolean (required)
 * 
 * Features:
 * - User authentication required
 * - Ownership verification (user can only update their own reviews)
 * - Comprehensive input validation
 * - Automatic updatedAt timestamp
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Authenticate user
    const user = await authMiddleware(request);
    if (user instanceof Response) {
      return user;
    }

    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 1) {
      return Response.json(
        { success: false, error: '올바른 리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
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
    let validatedData: UpdateReviewInput;
    try {
      validatedData = updateReviewSchema.parse(body);
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

    // Check if review exists and user owns it
    const existingReview = await prisma.review.findFirst({
      where: { 
        id,
        userId: user.userId // Ownership verification
      },
      select: {
        id: true,
        restaurantName: true,
      },
    });

    if (!existingReview) {
      return Response.json(
        { success: false, error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        restaurantName: validatedData.restaurantName,
        address: validatedData.address || null,
        content: validatedData.content,
        willRevisit: validatedData.willRevisit,
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

    console.log(`Updated review ${id} for restaurant "${updatedReview.restaurantName}" by user ${user.userId}`);

    return Response.json({
      success: true,
      data: updatedReview,
      message: '리뷰가 성공적으로 수정되었습니다.',
    });

  } catch (error) {
    console.error('Error updating review:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return Response.json(
          { success: false, error: '수정할 리뷰를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
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
        error: '리뷰 수정에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id] - Delete a specific review
 * 
 * Features:
 * - User authentication required
 * - Ownership verification (user can only delete their own reviews)
 * - Returns 404 if review not found or not owned by user
 * - Safe deletion using deleteMany for additional security
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Authenticate user
    const user = await authMiddleware(request);
    if (user instanceof Response) {
      return user;
    }

    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 1) {
      return Response.json(
        { success: false, error: '올바른 리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Get review info before deletion for logging
    const reviewToDelete = await prisma.review.findFirst({
      where: { 
        id,
        userId: user.userId 
      },
      select: {
        id: true,
        restaurantName: true,
      },
    });

    if (!reviewToDelete) {
      return Response.json(
        { success: false, error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Delete review with ownership verification for extra security
    // Using deleteMany ensures only the user's own reviews can be deleted
    const deletedReview = await prisma.review.deleteMany({
      where: { 
        id,
        userId: user.userId // Double ownership verification
      },
    });

    if (deletedReview.count === 0) {
      return Response.json(
        { success: false, error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log(`Deleted review ${id} for restaurant "${reviewToDelete.restaurantName}" by user ${user.userId}`);

    return Response.json({
      success: true,
      message: '리뷰가 성공적으로 삭제되었습니다.',
      data: {
        id,
        restaurantName: reviewToDelete.restaurantName,
      },
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return Response.json(
          { success: false, error: '삭제할 리뷰를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    return Response.json(
      { 
        success: false, 
        error: '리뷰 삭제에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}