import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/types/api';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.productProject.findUnique({
    where: { id: params.id },
    include: {
      aiOutputs: { orderBy: { createdAt: 'desc' } },
      pricingOutputs: { orderBy: { createdAt: 'desc' } },
      checklists: { orderBy: { createdAt: 'desc' } },
      approvals: { orderBy: { createdAt: 'desc' } },
      listingPackages: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!project) {
    return NextResponse.json(fail('NOT_FOUND', '프로젝트를 찾을 수 없습니다.'), { status: 404 });
  }

  return NextResponse.json(ok(project));
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const project = await prisma.productProject.update({
    where: { id: params.id },
    data: {
      title: body.title,
      sourceUrl: body.sourceUrl,
      sourcePlatform: body.sourcePlatform,
      rawProductName: body.rawProductName,
      rawDescription: body.rawDescription,
      categoryHint: body.categoryHint,
      supplyPrice: body.supplyPrice,
      domesticShippingCost: body.domesticShippingCost,
      imageUrls: body.imageUrls ? JSON.stringify(body.imageUrls) : undefined,
      memo: body.memo,
    },
  });

  return NextResponse.json(ok(project));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  // 실제 삭제 대신 폐기 처리한다(스펙 11.2).
  const project = await prisma.productProject.update({
    where: { id: params.id },
    data: { status: 'discarded' },
  });

  return NextResponse.json(ok(project));
}
