import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/types/api';

export async function GET(_req: NextRequest, { params }: { params: { outputId: string } }) {
  const output = await prisma.aiOutput.findUnique({ where: { id: params.outputId } });
  if (!output) {
    return NextResponse.json(fail('NOT_FOUND', '산출물을 찾을 수 없습니다.'), { status: 404 });
  }
  return NextResponse.json(ok(output));
}

export async function PATCH(req: NextRequest, { params }: { params: { outputId: string } }) {
  const body = await req.json();
  const existing = await prisma.aiOutput.findUniqueOrThrow({ where: { id: params.outputId } });

  const output = await prisma.aiOutput.update({
    where: { id: params.outputId },
    data: {
      outputJson: body.outputJson ? JSON.stringify(body.outputJson) : undefined,
      outputText: body.outputText,
      version: existing.version + 1,
    },
  });

  return NextResponse.json(ok(output));
}
