import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedProducts = [
  {
    title: '여름 여성 쿨링 이너 나시',
    sourcePlatform: 'domeme' as const,
    rawProductName: '여름 여성 쿨나시 브라탑 이너웨어',
    rawDescription:
      '얇고 시원한 소재의 여성용 여름 이너 나시. 셔츠나 가디건 안에 레이어드 가능.',
    categoryHint: '여성의류 > 이너웨어',
    supplyPrice: 1200,
    domesticShippingCost: 300,
    memo: '소량 테스트 후보. 썸네일 차별화 필요.',
  },
  {
    title: '주방 싱크대 물막이 실리콘 가드',
    sourcePlatform: 'manual' as const,
    rawProductName: '싱크대 실리콘 물막이',
    rawDescription: '설거지 중 물 튐을 줄여주는 실리콘 소재 주방용 물막이.',
    categoryHint: '주방용품',
    supplyPrice: 1800,
    domesticShippingCost: 400,
    memo: '생활 불편 해결형 상품.',
  },
];

async function main() {
  for (const p of seedProducts) {
    await prisma.productProject.create({ data: p });
  }
  console.log(`Seeded ${seedProducts.length} product projects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
