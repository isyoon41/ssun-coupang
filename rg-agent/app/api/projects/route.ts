import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/types/api';
import type { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.rawProductName && !body.sourceUrl && !body.rawDescription && !(body.imageUrls?.length)) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', 'URL, 상품명, 설명, 이미지 중 최소 하나는 입력해야 합니다.'),
      { status: 400 },
    );
  }

  const project = await prisma.productProject.create({
    data: {
      title: body.title ?? body.rawProductName ?? '새 상품 프로젝트',
      sourceUrl: body.sourceUrl,
      sourcePlatform: body.sourcePlatform ?? 'manual',
      rawProductName: body.rawProductName ?? body.title ?? '',
      rawDescription: body.rawDescription,
      categoryHint: body.categoryHint,
      supplyPrice: body.supplyPrice,
      domesticShippingCost: body.domesticShippingCost,
      imageUrls: body.imageUrls ? JSON.stringify(body.imageUrls) : undefined,
      memo: body.memo,
      status: 'source_added',
    },
  });

  return NextResponse.json(ok({ id: project.id, status: project.status }), { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const riskLevel = searchParams.get('riskLevel');
  const q = searchParams.get('q');
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '20');

  const where: Prisma.ProductProjectWhereInput = {};
  if (status) where.status = status as Prisma.ProductProjectWhereInput['status'];
  if (riskLevel) where.riskLevel = riskLevel as Prisma.ProductProjectWhereInput['riskLevel'];
  if (q) where.title = { contains: q };

  const [items, total] = await Promise.all([
    prisma.productProject.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.productProject.count({ where }),
  ]);

  return NextResponse.json(ok({ items, total, page, limit }));
}
