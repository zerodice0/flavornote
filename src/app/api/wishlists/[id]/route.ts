import { prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth-middleware';
import { 
  updateWishlistSchema,
  type UpdateWishlistInput
} from '@/lib/validations';
import { ZodError } from 'zod';

/**
 * GET /api/wishlists/[id] - Retrieve a specific wishlist item
 * Requires authentication and ownership verification
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Handle authentication
    const authResult = await authMiddleware(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { id } = await context.params;
    
    // Validate ID format (basic check)
    if (!id || typeof id !== 'string') {
      return Response.json(
        { success: false, error: '유효하지 않은 위시리스트 ID입니다.' },
        { status: 400 }
      );
    }
    
    // Find wishlist with ownership verification
    const wishlist = await prisma.wishlist.findFirst({
      where: { 
        id,
        userId: authResult.userId, // Ownership verification
      },
      select: {
        id: true,
        restaurantName: true,
        address: true,
        memo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!wishlist) {
      return Response.json(
        { success: false, error: '위시리스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      data: wishlist,
    });
    
  } catch (error) {
    console.error('Get wishlist error:', error);
    return Response.json(
      { success: false, error: '위시리스트를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/wishlists/[id] - Update a specific wishlist item
 * Requires authentication and ownership verification
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Handle authentication
    const authResult = await authMiddleware(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { id } = await context.params;
    
    // Validate ID format
    if (!id || typeof id !== 'string') {
      return Response.json(
        { success: false, error: '유효하지 않은 위시리스트 ID입니다.' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate input data
    const validatedData: UpdateWishlistInput = updateWishlistSchema.parse(body);
    
    // Clean up empty strings to null for optional fields
    const cleanedData = {
      ...validatedData,
      address: validatedData.address?.trim() || null,
      memo: validatedData.memo?.trim() || null,
    };
    
    // Check if wishlist exists and user owns it
    const existingWishlist = await prisma.wishlist.findFirst({
      where: { 
        id,
        userId: authResult.userId, // Ownership verification
      },
      select: { id: true },
    });
    
    if (!existingWishlist) {
      return Response.json(
        { success: false, error: '위시리스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // Update wishlist
    const updatedWishlist = await prisma.wishlist.update({
      where: { id },
      data: cleanedData,
      select: {
        id: true,
        restaurantName: true,
        address: true,
        memo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return Response.json({
      success: true,
      data: updatedWishlist,
      message: '위시리스트가 수정되었습니다.',
    });
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return Response.json(
        { 
          success: false, 
          error: firstError.message,
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        },
        { status: 400 }
      );
    }
    
    // Handle database errors
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return Response.json(
        { success: false, error: '위시리스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // Generic error handling
    console.error('Update wishlist error:', error);
    return Response.json(
      { success: false, error: '위시리스트 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wishlists/[id] - Delete a specific wishlist item
 * Requires authentication and ownership verification
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Handle authentication
    const authResult = await authMiddleware(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { id } = await context.params;
    
    // Validate ID format
    if (!id || typeof id !== 'string') {
      return Response.json(
        { success: false, error: '유효하지 않은 위시리스트 ID입니다.' },
        { status: 400 }
      );
    }
    
    // Delete with ownership verification using deleteMany for safety
    const deletedWishlist = await prisma.wishlist.deleteMany({
      where: { 
        id,
        userId: authResult.userId, // Ownership verification
      },
    });
    
    if (deletedWishlist.count === 0) {
      return Response.json(
        { success: false, error: '위시리스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: '위시리스트에서 삭제되었습니다.',
    });
    
  } catch (error) {
    // Handle database errors
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return Response.json(
        { success: false, error: '위시리스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // Generic error handling
    console.error('Delete wishlist error:', error);
    return Response.json(
      { success: false, error: '위시리스트 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}