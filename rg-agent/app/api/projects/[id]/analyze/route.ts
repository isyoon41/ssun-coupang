import { NextRequest, NextResponse } from 'next/server';
import { ok, fail } from '@/types/api';
import { runFullAnalysis } from '@/lib/ai/orchestrator';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));

  try {
    // MVP 는 동기 실행이다. Queue 기반 비동기 실행은 향후 확장 포인트(TODO v1.1+).
    const result = await runFullAnalysis(params.id);
    return NextResponse.json(
      ok({ jobId: `sync_${params.id}_${Date.now()}`, status: 'completed', mode: body.mode ?? 'full', result }),
    );
  } catch (e) {
    return NextResponse.json(fail('ANALYZE_FAILED', '분석 실행 중 오류가 발생했습니다.', String(e)), {
      status: 500,
    });
  }
}
