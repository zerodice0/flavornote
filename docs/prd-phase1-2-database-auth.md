# FlavorNote PRD - Phase 1.2: 데이터베이스 및 인증 시스템

## 🎯 목표
PostgreSQL 데이터베이스 스키마를 구축하고 JWT 기반 인증 시스템을 완성하여 사용자 관리 기반을 마련합니다.

## 📋 구현 범위

### ✅ 포함 기능

#### 1. 데이터베이스 스키마 구축
- **Prisma 스키마 업데이트**: Phase 1 필요 테이블만 포함
- **마이그레이션 생성**: 개발 환경용 초기 마이그레이션
- **시드 데이터**: 개발용 테스트 데이터

#### 2. 인증 API 구현
- **회원가입 API**: `POST /api/auth/register`
- **로그인 API**: `POST /api/auth/login`
- **로그아웃 API**: `POST /api/auth/logout`
- **사용자 정보 API**: `GET /api/auth/me`

#### 3. 인증 미들웨어
- **JWT 토큰 검증**: 보호된 라우트용 미들웨어
- **AuthContext**: React Context로 인증 상태 관리
- **보호된 라우트**: 인증 필요 페이지 리다이렉트

#### 4. 인증 UI 컴포넌트
- **LoginForm**: 로그인 폼 컴포넌트
- **RegisterForm**: 회원가입 폼 컴포넌트
- **AuthGuard**: 인증 상태 확인 HOC

### ❌ 제외 기능
- 소셜 로그인
- 이메일 인증
- 비밀번호 재설정
- 고급 보안 기능 (2FA 등)

## 🗄️ 데이터베이스 스키마 (Phase 1 전용)

### 간소화된 Prisma 스키마
```prisma
// prisma/schema.prisma 업데이트
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  nickname  String
  password  String   // bcrypt 해시
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations (Phase 1용)
  wishlists Wishlist[]
  reviews   Review[]

  @@map("users")
}

model Wishlist {
  id             String   @id @default(cuid())
  restaurantName String   @map("restaurant_name")
  address        String?
  memo           String?
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("wishlists")
}

model Review {
  id             String   @id @default(cuid())
  restaurantName String   @map("restaurant_name")
  address        String?
  content        String
  willRevisit    Boolean  @map("will_revisit")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("reviews")
}
```

## 🛣️ API 구현 상세

### 1. 회원가입 API
```typescript
// src/app/api/auth/register/route.ts
import { hash } from 'bcryptjs';
import { createUserSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);
    
    // 이메일 중복 검사
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });
    
    if (existingUser) {
      return Response.json(
        { success: false, error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }
    
    // 비밀번호 해시
    const hashedPassword = await hash(validatedData.password, 12);
    
    // 사용자 생성
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
    
    // JWT 토큰 생성
    const token = await signToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
    });
    
    return Response.json({
      success: true,
      data: { user, token }
    });
    
  } catch (error) {
    return Response.json(
      { success: false, error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

### 2. 로그인 API
```typescript
// src/app/api/auth/login/route.ts
import { compare } from 'bcryptjs';
import { loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    
    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });
    
    if (!user) {
      return Response.json(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
    
    // 비밀번호 검증
    const isValidPassword = await compare(validatedData.password, user.password);
    
    if (!isValidPassword) {
      return Response.json(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
    
    // JWT 토큰 생성
    const token = await signToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
    });
    
    return Response.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          createdAt: user.createdAt,
        },
        token
      }
    });
    
  } catch (error) {
    return Response.json(
      { success: false, error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

### 3. 인증 미들웨어
```typescript
// src/lib/auth-middleware.ts
import { verifyToken } from '@/lib/auth';

export async function authMiddleware(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return Response.json(
      { success: false, error: '인증 토큰이 필요합니다.' },
      { status: 401 }
    );
  }
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    return Response.json(
      { success: false, error: '유효하지 않은 토큰입니다.' },
      { status: 401 }
    );
  }
  
  return payload;
}
```

## ⚛️ React 인증 시스템

### AuthContext 구현
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 토큰을 localStorage에서 불러오기
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // 토큰으로 사용자 정보 가져오기
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('token', data.data.token);
    } else {
      throw new Error(data.error);
    }
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### AuthGuard 컴포넌트
```typescript
// src/components/auth/AuthGuard.tsx
interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return <Loading />;
  }
  
  if (!user) {
    return fallback || <div>Redirecting...</div>;
  }
  
  return <>{children}</>;
}
```

### 인증 폼 컴포넌트
```typescript
// src/components/auth/LoginForm.tsx
export function LoginForm() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password);
      router.push('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        label="이메일"
        type="email"
        {...form.register('email')}
        error={form.formState.errors.email?.message}
      />
      <Input
        label="비밀번호"
        type="password"
        {...form.register('password')}
        error={form.formState.errors.password?.message}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" loading={loading} fullWidth>
        로그인
      </Button>
    </form>
  );
}
```

## 🛠️ 기술 상세

### 필요한 추가 패키지
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

### 스키마 검증 업데이트
```typescript
// src/lib/validations.ts 확장
export const createUserSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  nickname: z.string()
    .min(2, '닉네임은 2글자 이상이어야 합니다')
    .max(20, '닉네임은 20글자를 초과할 수 없습니다'),
  password: z.string()
    .min(8, '비밀번호는 8글자 이상이어야 합니다')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '비밀번호는 영문과 숫자를 포함해야 합니다'),
});

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

## 📋 구현 체크리스트

### 데이터베이스 설정
- [ ] Prisma 스키마 업데이트 (Phase 1 테이블만)
- [ ] bcryptjs 패키지 설치
- [ ] 첫 번째 마이그레이션 생성
- [ ] 시드 데이터 작성

### 인증 API 구현
- [ ] 회원가입 API 구현
- [ ] 로그인 API 구현
- [ ] 로그아웃 API 구현
- [ ] 사용자 정보 API 구현

### React 인증 시스템
- [ ] AuthContext 구현
- [ ] AuthProvider 설정
- [ ] AuthGuard 컴포넌트 구현
- [ ] useAuth 훅 구현

### 인증 UI 구현
- [ ] LoginForm 컴포넌트 구현
- [ ] RegisterForm 컴포넌트 구현
- [ ] 로그인 페이지 완성
- [ ] 회원가입 페이지 완성

### 보안 설정
- [ ] JWT 토큰 만료 설정
- [ ] 비밀번호 해시 강도 설정
- [ ] HTTPS 설정 (프로덕션)
- [ ] Rate limiting 기본 설정

## 🎯 완료 조건

1. **회원가입/로그인 동작**: 실제 계정 생성 및 로그인 가능
2. **인증 상태 유지**: 새로고침 시에도 로그인 상태 유지
3. **보호된 라우트**: 인증 없이 메인 페이지 접근 시 로그인 페이지로 리다이렉트
4. **에러 처리**: 적절한 에러 메시지 표시

## 🚀 다음 단계 (Phase 1.3)

인증 시스템 완성 후 위시리스트 CRUD 기능을 구현합니다.