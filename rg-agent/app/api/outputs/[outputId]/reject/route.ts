import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok } from '@/types/api';

export async function POST(req: NextRequest, { params }: { params: { outputId: string } }) {
  const body = await req.json().catch(() => ({}));

  const output = await prisma.aiOutput.update({
    where: { id: params.outputId },
    data: { status: 'rejected' },
  });

  const approval = await prisma.approval.create({
    data: {
      projectId: output.projectId,
      aiOutputId: output.id,
      outputType: output.outputType,
      status: 'rejected',
      feedback: body.feedback,
    },
  });

  return NextResponse.json(ok({ output, approval }));
}
