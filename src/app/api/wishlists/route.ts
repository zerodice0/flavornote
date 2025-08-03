import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth-middleware';
import { 
  createWishlistSchema, 
  wishlistQuerySchema,
  type CreateWishlistInput,
  type WishlistQueryParams
} from '@/lib/validations';
import { ZodError } from 'zod';

/**
 * GET /api/wishlists - Retrieve user's wishlists with pagination
 * Requires authentication
 */
export const GET = withAuth(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate and parse query parameters
    const queryParams: WishlistQueryParams = wishlistQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });
    
    const { page, limit } = queryParams;
    const skip = (page - 1) * limit;
    
    // Fetch wishlists and total count in parallel
    const [wishlists, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          restaurantName: true,
          address: true,
          memo: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.wishlist.count({
        where: { userId: user.userId },
      }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return Response.json({
      success: true,
      data: {
        wishlists,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return Response.json(
        { 
          success: false, 
          error: '잘못된 요청 매개변수입니다.',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        },
        { status: 400 }
      );
    }
    
    // Generic error handling
    console.error('Get wishlists error:', error);
    return Response.json(
      { success: false, error: '위시리스트를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/wishlists - Create a new wishlist item
 * Requires authentication
 */
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json();
    
    // Validate input data
    const validatedData: CreateWishlistInput = createWishlistSchema.parse(body);
    
    // Clean up empty strings to null for optional fields
    const cleanedData = {
      ...validatedData,
      address: validatedData.address?.trim() || null,
      memo: validatedData.memo?.trim() || null,
    };
    
    // Create wishlist item
    const wishlist = await prisma.wishlist.create({
      data: {
        ...cleanedData,
        userId: user.userId,
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
    
    return Response.json({
      success: true,
      data: wishlist,
      message: '위시리스트에 추가되었습니다.',
    }, { status: 201 });
    
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
    
    // Handle database constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return Response.json(
        { success: false, error: '이미 동일한 위시리스트가 존재합니다.' },
        { status: 409 }
      );
    }
    
    // Generic error handling
    console.error('Create wishlist error:', error);
    return Response.json(
      { success: false, error: '위시리스트 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
});