import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok } from '@/types/api';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const outputs = await prisma.aiOutput.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(ok(outputs));
}
