import { NextRequest, NextResponse } from 'next/server';
import { ok, fail } from '@/types/api';
import { runSingleAgent } from '@/lib/ai/orchestrator';
import type { AgentType } from '@/types/domain';

const RUNNABLE_AGENT_TYPES: AgentType[] = [
  'intake',
  'product_analysis',
  'risk',
  'market_strategy',
  'seo',
  'creative',
  'rocketgrowth_ops',
  'ad_strategy',
  'qa',
];

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; agentType: string } },
) {
  if (!RUNNABLE_AGENT_TYPES.includes(params.agentType as AgentType)) {
    return NextResponse.json(
      fail('UNSUPPORTED_AGENT', `개별 실행을 지원하지 않는 agentType 입니다: ${params.agentType}`),
      { status: 400 },
    );
  }

  try {
    const aiOutput = await runSingleAgent(params.id, params.agentType as AgentType);
    return NextResponse.json(
      ok({ aiOutputId: aiOutput.id, agentType: aiOutput.agentType, status: aiOutput.status }),
    );
  } catch (e) {
    return NextResponse.json(fail('AGENT_RUN_FAILED', 'Agent 실행 중 오류가 발생했습니다.', String(e)), {
      status: 500,
    });
  }
}
