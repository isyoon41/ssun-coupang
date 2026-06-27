import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/types/api';

export async function POST(req: NextRequest, { params }: { params: { outputId: string } }) {
  const body = await req.json().catch(() => ({}));

  if (!body.feedback) {
    return NextResponse.json(fail('VALIDATION_ERROR', '수정 요청에는 feedback이 필요합니다.'), { status: 400 });
  }

  const output = await prisma.aiOutput.update({
    where: { id: params.outputId },
    data: { status: 'revision_requested' },
  });

  const approval = await prisma.approval.create({
    data: {
      projectId: output.projectId,
      aiOutputId: output.id,
      outputType: output.outputType,
      status: 'revision_requested',
      feedback: body.feedback,
    },
  });

  return NextResponse.json(ok({ output, approval }));
}
