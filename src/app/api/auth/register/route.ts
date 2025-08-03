import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { createUserSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input data with Zod
    const validatedData = createUserSchema.parse(body);
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });
    
    if (existingUser) {
      return Response.json(
        { success: false, error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }
    
    // Check if nickname already exists
    const existingNickname = await prisma.user.findFirst({
      where: { nickname: validatedData.nickname }
    });
    
    if (existingNickname) {
      return Response.json(
        { success: false, error: '이미 사용 중인 닉네임입니다.' },
        { status: 400 }
      );
    }
    
    // Hash password with bcrypt (strength 12)
    const hashedPassword = await hash(validatedData.password, 12);
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        nickname: validatedData.nickname,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
      }
    });
    
    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
    });
    
    return Response.json({
      success: true,
      data: { user, token }
    }, { status: 201 });
    
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return Response.json(
        { success: false, error: firstError.message },
        { status: 400 }
      );
    }
    
    // Handle database errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return Response.json(
        { success: false, error: '이미 사용 중인 정보입니다.' },
        { status: 400 }
      );
    }
    
    // Generic error handling
    console.error('Registration error:', error);
    return Response.json(
      { success: false, error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}