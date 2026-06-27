import { NextRequest, NextResponse } from 'next/server';
import { ok, fail } from '@/types/api';
import { calculatePricing, DEFAULT_PRICING_INPUT } from '@/lib/pricing/calculator';
import { savePricingOutput } from '@/lib/ai/orchestrator';
import type { PricingInput } from '@/types/domain';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const input: PricingInput = { ...DEFAULT_PRICING_INPUT, ...body };

  try {
    const output = calculatePricing(input);
    await savePricingOutput(params.id, input, output);
    return NextResponse.json(ok(output));
  } catch (e) {
    return NextResponse.json(fail('PRICING_FAILED', '가격 계산 중 오류가 발생했습니다.', String(e)), {
      status: 500,
    });
  }
}
