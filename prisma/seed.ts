import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for Phase 1...');

  // Create test user
  const hashedPassword = await hash('password123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@flavornote.com' },
    update: {},
    create: {
      email: 'test@flavornote.com',
      nickname: '테스트유저',
      password: hashedPassword,
    },
  });

  console.log('✅ Created test user:', testUser.email);

  // Create sample wishlist items
  const wishlist1 = await prisma.wishlist.create({
    data: {
      restaurantName: '맛있는 한식당',
      address: '서울시 강남구 역삼동 123-45',
      memo: '친구 추천 맛집, 삼겹살이 유명하다고 함',
      userId: testUser.id,
    },
  });

  const wishlist2 = await prisma.wishlist.create({
    data: {
      restaurantName: '이탈리안 레스토랑 로마',
      address: '서울시 홍대입구역 근처',
      memo: '파스타와 피자가 맛있다는 리뷰',
      userId: testUser.id,
    },
  });

  console.log('✅ Created wishlist items:', [wishlist1.restaurantName, wishlist2.restaurantName]);

  // Create sample reviews
  const review1 = await prisma.review.create({
    data: {
      restaurantName: '김치찌개 전문점',
      address: '서울시 마포구 홍대동 456-78',
      content: '김치찌개가 정말 맛있었어요! 밑반찬도 다양하고 사장님이 친절하세요. 다음에 또 가고 싶은 곳입니다.',
      willRevisit: true,
      userId: testUser.id,
    },
  });

  const review2 = await prisma.review.create({
    data: {
      restaurantName: '스시 오마카세',
      address: '서울시 강남구 논현동 789-12',
      content: '신선한 재료로 만든 스시가 일품이었습니다. 가격은 조금 비싸지만 특별한 날 가기 좋은 곳이네요.',
      willRevisit: false,
      userId: testUser.id,
    },
  });

  console.log('✅ Created reviews:', [review1.restaurantName, review2.restaurantName]);

  console.log('🎉 Phase 1 seed data created successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });