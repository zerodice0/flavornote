import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
);

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  nickname: string;
}

export const signToken = async (
  payload: Omit<TokenPayload, keyof JWTPayload>
): Promise<string> => {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return jwt;
};

export const verifyToken = async (
  token: string | null
): Promise<TokenPayload | null> => {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'userId' in payload &&
      'email' in payload &&
      'nickname' in payload
    ) {
      return payload as TokenPayload;
    }

    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Token verification failed:', error);
    return null;
  }
};
