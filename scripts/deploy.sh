#!/bin/bash

set -e  # 에러 시 중단

echo "🚀 FlavorNote 배포 시작..."

# 타입 체크
echo "📝 TypeScript 타입 체크..."
npm run type-check

# 린트 검사
echo "🔍 ESLint 검사..."
npm run lint

# 테스트 실행
echo "🧪 테스트 실행..."
npm run test

# 빌드
echo "🔨 프로덕션 빌드..."
npm run build

# Docker 이미지 빌드
echo "🐳 Docker 이미지 빌드..."
docker-compose build

# 서비스 재시작
echo "♻️ 서비스 재시작..."
docker-compose down
docker-compose up -d

echo "✅ 배포 완료!"