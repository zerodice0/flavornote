export async function POST() {
  try {
    // Since we're using JWT tokens stored client-side (localStorage),
    // logout is primarily a client-side operation.
    // This endpoint exists for consistency and potential future server-side logout logic.
    
    return Response.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { success: false, error: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Optional: Support GET method for compatibility
export async function GET() {
  return Response.json({
    success: true,
    message: '로그아웃되었습니다.'
  });
}