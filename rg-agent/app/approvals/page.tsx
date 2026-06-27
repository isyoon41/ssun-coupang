import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

const AGENT_TYPE_LABEL: Record<string, string> = {
  intake: '인테이크',
  product_analysis: '상품 분석',
  risk: '리스크 점검',
  market_strategy: '마케팅 전략',
  seo: 'SEO',
  creative: '콘텐츠/크리에이티브',
  rocketgrowth_ops: '입고 체크리스트',
  ad_strategy: '광고 전략',
  qa: 'QA',
};

export default async function ApprovalsPage() {
  const pendingOutputs = await prisma.aiOutput.findMany({
    where: { status: 'draft' },
    include: { project: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">검수·승인 대기 목록</h1>
        <p className="text-sm text-slate-500">
          AI 산출물은 승인해야 최종 등록 패키지에 포함됩니다. 프로젝트 상세에서 개별 검수가 가능합니다.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>대기 중인 산출물 ({pendingOutputs.length})</CardTitle></CardHeader>
        <CardContent>
          {pendingOutputs.length === 0 ? (
            <EmptyState title="검수 대기 중인 산출물이 없습니다" />
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {pendingOutputs.map((output) => (
                <div key={output.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{output.project.title}</p>
                    <Badge variant="outline" className="mt-1">
                      {AGENT_TYPE_LABEL[output.agentType] ?? output.agentType}
                    </Badge>
                  </div>
                  <Link
                    href={`/projects/${output.projectId}`}
                    className="text-sm font-medium text-brand-600 hover:underline"
                  >
                    검수하러 가기 →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
