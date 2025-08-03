import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return Response.json(
        { success: false, error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // Verify JWT token
    const payload = await verifyToken(token);
    
    if (!payload) {
      return Response.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }
    
    // Get user from database with counts
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            wishlists: true,
            reviews: true,
          }
        }
      }
    });
    
    if (!user) {
      return Response.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          _count: user._count
        }
      }
    });
    
  } catch (error) {
    console.error('Get user profile error:', error);
    return Response.json(
      { success: false, error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}