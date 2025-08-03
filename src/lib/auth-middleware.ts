import { verifyToken, type TokenPayload } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Authentication middleware for protected API routes
 * Verifies JWT token and returns user payload or error response
 */
export async function authMiddleware(request: Request): Promise<TokenPayload | Response> {
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
  
  // Optional: Verify user still exists in database
  const userExists = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true }
  });
  
  if (!userExists) {
    return Response.json(
      { success: false, error: '사용자를 찾을 수 없습니다.' },
      { status: 401 }
    );
  }
  
  return payload;
}

/**
 * Higher-order function to protect API routes with authentication
 * Usage: export const POST = withAuth(async (request, user) => { ... });
 * For routes with params: export const PUT = withAuth(async (request, user, context) => { ... });
 */
export function withAuth<T = unknown>(
  handler: (request: Request, user: TokenPayload, context?: T) => Promise<Response>
) {
  return async (request: Request, context?: T): Promise<Response> => {
    try {
      const authResult = await authMiddleware(request);
      
      // If authResult is a Response, it means authentication failed
      if (authResult instanceof Response) {
        return authResult;
      }
      
      // Authentication successful, call the handler with user info and context
      return await handler(request, authResult, context);
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      return Response.json(
        { success: false, error: '인증 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  };
}

/**
 * Optional middleware for API routes that work with or without authentication
 * Returns user info if authenticated, null if not authenticated
 */
export async function optionalAuth(request: Request): Promise<TokenPayload | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }
    
    const payload = await verifyToken(token);
    
    if (!payload) {
      return null;
    }
    
    // Verify user still exists
    const userExists = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true }
    });
    
    return userExists ? payload : null;
    
  } catch (error) {
    console.error('Optional auth error:', error);
    return null;
  }
}