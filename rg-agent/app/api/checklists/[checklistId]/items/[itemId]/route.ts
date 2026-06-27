import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/types/api';
import type { ChecklistItem } from '@/types/domain';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { checklistId: string; itemId: string } },
) {
  const body = await req.json();
  const checklist = await prisma.checklist.findUnique({ where: { id: params.checklistId } });

  if (!checklist) {
    return NextResponse.json(fail('NOT_FOUND', '체크리스트를 찾을 수 없습니다.'), { status: 404 });
  }

  const items = JSON.parse(checklist.items) as ChecklistItem[];
  const idx = items.findIndex((i) => i.id === params.itemId);
  if (idx === -1) {
    return NextResponse.json(fail('NOT_FOUND', '체크리스트 항목을 찾을 수 없습니다.'), { status: 404 });
  }

  items[idx] = { ...items[idx], completed: Boolean(body.completed) };
  const completionRate = (items.filter((i) => i.completed).length / items.length) * 100;

  const updated = await prisma.checklist.update({
    where: { id: params.checklistId },
    data: { items: JSON.stringify(items), completionRate },
  });

  return NextResponse.json(ok(updated));
}
