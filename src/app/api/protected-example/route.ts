import { withAuth } from '@/lib/auth-middleware';

/**
 * Example of a protected API route using the withAuth middleware
 * This route requires authentication and provides access to user info
 */
export const GET = withAuth(async (_request, user) => {
  // user parameter contains the authenticated user's token payload
  // { userId: string, email: string, nickname: string, iat: number, exp: number }
  
  return Response.json({
    success: true,
    message: '이것은 보호된 라우트입니다.',
    user: {
      id: user.userId,
      email: user.email,
      nickname: user.nickname,
    },
    timestamp: new Date().toISOString(),
  });
});

export const POST = withAuth(async (request, user) => {
  const body = await request.json();
  
  return Response.json({
    success: true,
    message: 'POST 요청이 성공적으로 처리되었습니다.',
    receivedData: body,
    authenticatedUser: user.nickname,
  });
});