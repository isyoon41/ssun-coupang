'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { ProjectStatusBadge } from '@/components/domain/project-status-badge';
import { RiskLevelBadge } from '@/components/domain/risk-level-badge';
import { RecommendationGradeBadge } from '@/components/domain/recommendation-grade-badge';
import { AiOutputCard } from '@/components/domain/ai-output-card';
import { RiskPanel } from '@/components/domain/risk-panel';
import { SeoTagsEditor } from '@/components/domain/seo-tags-editor';
import { DetailPagePreview } from '@/components/domain/detail-page-preview';
import { PricingCalculatorForm } from '@/components/domain/pricing-calculator-form';
import { PricingResultCard } from '@/components/domain/pricing-result-card';
import { ChecklistPanel } from '@/components/domain/checklist-panel';
import { ListingPackagePreview } from '@/components/domain/listing-package-preview';
import { formatKrw } from '@/lib/utils';
import { DEFAULT_PRICING_INPUT } from '@/lib/pricing/calculator';
import type {
  ProductAnalysisOutput,
  RiskOutput,
  MarketStrategyOutput,
  SeoOutput,
  CreativeOutput,
  PricingCalcOutput,
  AdStrategyOutput,
  QaOutput,
  PackagerOutput,
  ChecklistItem,
} from '@/types/domain';

interface AiOutputRow {
  id: string;
  agentType: string;
  outputType: string;
  title: string | null;
  outputJson: string;
  status: string;
  version: number;
}

interface PricingOutputRow {
  id: string;
  recommendedPrice: number;
  minimumPrice: number;
  adSafePrice: number;
  expectedProfit: number;
  expectedMarginRate: number;
  breakevenQuantity: number | null;
  recommendedInboundQty: number | null;
  totalInitialCost: number | null;
  formulaJson: string | null;
}

interface ChecklistRow {
  id: string;
  title: string;
  items: string;
  completionRate: number;
}

interface ListingPackageRow {
  id: string;
  title: string;
  packageJson: string;
}

interface ProjectData {
  id: string;
  title: string;
  status: string;
  riskLevel: string | null;
  recommendationGrade: string | null;
  recommendedPrice: number | null;
  expectedMarginRate: number | null;
  supplyPrice: number | null;
  domesticShippingCost: number | null;
  categoryHint: string | null;
  categoryCandidate: string | null;
  rawDescription: string | null;
  memo: string | null;
  aiOutputs: AiOutputRow[];
  pricingOutputs: PricingOutputRow[];
  checklists: ChecklistRow[];
  listingPackages: ListingPackageRow[];
}

function latestByType(outputs: AiOutputRow[], outputType: string) {
  return outputs.find((o) => o.outputType === outputType);
}

export function ProjectWorkspace({ project }: { project: ProjectData }) {
  const router = useRouter();
  const [tab, setTab] = useState('overview');
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => router.refresh();

  const analysis = latestByType(project.aiOutputs, 'product_analysis');
  const risk = latestByType(project.aiOutputs, 'risk');
  const strategy = latestByType(project.aiOutputs, 'market_strategy');
  const seo = latestByType(project.aiOutputs, 'seo');
  const creative = latestByType(project.aiOutputs, 'creative');
  const ops = latestByType(project.aiOutputs, 'rocketgrowth_ops');
  const ad = latestByType(project.aiOutputs, 'ad_strategy');
  const qa = latestByType(project.aiOutputs, 'qa');
  const latestPricing = project.pricingOutputs[0];
  const latestPackage = project.listingPackages[0];

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/analyze`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? 'AI 분석 실행 중 오류가 발생했습니다.');
        return;
      }
      refresh();
    } finally {
      setAnalyzing(false);
    }
  };

  const generatePackage = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/listing-package/generate`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? '등록 패키지 생성에 실패했습니다.');
        return;
      }
      setTab('package');
      refresh();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{project.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <ProjectStatusBadge status={project.status} />
            <RiskLevelBadge level={project.riskLevel} />
            <RecommendationGradeBadge grade={project.recommendationGrade} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAnalysis} disabled={analyzing}>
            {analyzing ? 'AI 분석 중...' : project.aiOutputs.length ? 'AI 분석 다시 실행' : 'AI 분석 실행'}
          </Button>
          <Button variant="secondary" onClick={generatePackage} disabled={generating}>
            {generating ? '생성 중...' : '등록 패키지 생성'}
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="danger"><AlertDescription>{error}</AlertDescription></Alert>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="analysis">상품 분석</TabsTrigger>
          <TabsTrigger value="risk">리스크</TabsTrigger>
          <TabsTrigger value="content">콘텐츠/SEO</TabsTrigger>
          <TabsTrigger value="ad">광고 전략</TabsTrigger>
          <TabsTrigger value="pricing">가격/마진</TabsTrigger>
          <TabsTrigger value="checklist">입고 체크리스트</TabsTrigger>
          <TabsTrigger value="qa">QA</TabsTrigger>
          <TabsTrigger value="package">등록 패키지</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>카테고리 힌트: {project.categoryHint ?? '미입력'}</p>
              <p>카테고리 후보(AI): {project.categoryCandidate ?? '미산출'}</p>
              <p>공급가: {formatKrw(project.supplyPrice)}</p>
              <p>국내 배송비: {formatKrw(project.domesticShippingCost)}</p>
              <p className="sm:col-span-2 whitespace-pre-line">{project.rawDescription ?? '설명 없음'}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          {analysis ? (
            <AiOutputCard
              outputId={analysis.id}
              title="상품 분석 결과"
              status={analysis.status}
              version={analysis.version}
              onChanged={refresh}
            >
              <AnalysisView data={JSON.parse(analysis.outputJson) as ProductAnalysisOutput} />
            </AiOutputCard>
          ) : (
            <EmptyState title="아직 분석 결과가 없습니다" description="AI 분석을 실행해보세요." />
          )}
          {strategy ? (
            <div className="mt-4">
              <AiOutputCard
                outputId={strategy.id}
                title="마케팅 전략"
                status={strategy.status}
                version={strategy.version}
                onChanged={refresh}
              >
                <StrategyView data={JSON.parse(strategy.outputJson) as MarketStrategyOutput} />
              </AiOutputCard>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="risk">
          {risk ? (
            <AiOutputCard
              outputId={risk.id}
              title="리스크 1차 점검"
              status={risk.status}
              version={risk.version}
              onChanged={refresh}
            >
              <RiskPanel risk={JSON.parse(risk.outputJson) as RiskOutput} />
            </AiOutputCard>
          ) : (
            <EmptyState title="아직 리스크 점검 결과가 없습니다" />
          )}
        </TabsContent>

        <TabsContent value="content">
          <div className="flex flex-col gap-4">
            {seo ? (
              <AiOutputCard
                outputId={seo.id}
                title="SEO 상품명 / 검색어 태그"
                status={seo.status}
                version={seo.version}
                onChanged={refresh}
              >
                <SeoTagsEditor seo={JSON.parse(seo.outputJson) as SeoOutput} />
              </AiOutputCard>
            ) : (
              <EmptyState title="아직 SEO 결과가 없습니다" />
            )}
            {creative ? (
              <AiOutputCard
                outputId={creative.id}
                title="상세페이지 / 크리에이티브"
                status={creative.status}
                version={creative.version}
                onChanged={refresh}
              >
                <DetailPagePreview creative={JSON.parse(creative.outputJson) as CreativeOutput} />
              </AiOutputCard>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="ad">
          {ad ? (
            <AiOutputCard
              outputId={ad.id}
              title="광고 전략"
              status={ad.status}
              version={ad.version}
              onChanged={refresh}
            >
              <AdStrategyView data={JSON.parse(ad.outputJson) as AdStrategyOutput} />
            </AiOutputCard>
          ) : (
            <EmptyState title="아직 광고 전략 결과가 없습니다" />
          )}
        </TabsContent>

        <TabsContent value="pricing">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader><CardTitle>가격 계산</CardTitle></CardHeader>
              <CardContent>
                <PricingCalculatorForm
                  projectId={project.id}
                  defaultInput={{
                    ...DEFAULT_PRICING_INPUT,
                    supplyPrice: project.supplyPrice ?? 0,
                    domesticShippingCost: project.domesticShippingCost ?? 0,
                  }}
                  onResult={() => refresh()}
                />
              </CardContent>
            </Card>
            {latestPricing ? (
              <PricingResultCard
                result={{
                  recommendedPrice: latestPricing.recommendedPrice,
                  minimumPrice: latestPricing.minimumPrice,
                  adSafePrice: latestPricing.adSafePrice,
                  expectedProfit: latestPricing.expectedProfit,
                  expectedMarginRate: latestPricing.expectedMarginRate,
                  breakevenQuantity: latestPricing.breakevenQuantity ?? 0,
                  recommendedInboundQty: latestPricing.recommendedInboundQty ?? 0,
                  totalInitialCost: latestPricing.totalInitialCost ?? 0,
                  warnings: [],
                  formula: latestPricing.formulaJson ? JSON.parse(latestPricing.formulaJson) : {},
                } as PricingCalcOutput}
              />
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          {project.checklists.length ? (
            <div className="flex flex-col gap-4">
              {project.checklists.map((checklist) => (
                <Card key={checklist.id}>
                  <CardContent className="pt-4">
                    <ChecklistPanel
                      checklistId={checklist.id}
                      title={checklist.title}
                      items={JSON.parse(checklist.items) as ChecklistItem[]}
                      completionRate={checklist.completionRate}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="아직 체크리스트가 없습니다" description="AI 분석을 실행하면 로켓그로스 입고 체크리스트가 생성됩니다." />
          )}
        </TabsContent>

        <TabsContent value="qa">
          {qa ? (
            <AiOutputCard outputId={qa.id} title="QA 검수" status={qa.status} version={qa.version} onChanged={refresh}>
              <QaView data={JSON.parse(qa.outputJson) as QaOutput} />
            </AiOutputCard>
          ) : (
            <EmptyState title="아직 QA 결과가 없습니다" />
          )}
        </TabsContent>

        <TabsContent value="package">
          {latestPackage ? (
            <ListingPackagePreview
              listingPackageId={latestPackage.id}
              packageData={JSON.parse(latestPackage.packageJson) as PackagerOutput}
            />
          ) : (
            <EmptyState
              title="아직 등록 패키지가 없습니다"
              description="산출물을 승인한 뒤 '등록 패키지 생성'을 눌러주세요. 승인된 항목만 패키지에 반영됩니다."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalysisView({ data }: { data: ProductAnalysisOutput }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-slate-800">{data.oneLineSummary}</p>
      <p>판매 난이도: {data.sellingDifficulty} / 추천 사유: {data.recommendationReason}</p>
      <ListBlock title="주요 특징" items={data.mainFeatures} />
      <ListBlock title="타겟 고객" items={data.targetCustomers} />
      <ListBlock title="구매 트리거" items={data.purchaseTriggers} />
      <ListBlock title="구매 장벽" items={data.purchaseBarriers} />
      <ListBlock title="유의사항" items={data.cautions} />
    </div>
  );
}

function StrategyView({ data }: { data: MarketStrategyOutput }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-slate-800">{data.positioningStatement}</p>
      <ListBlock title="핵심 셀링포인트" items={data.coreSellingPoints} />
      <ListBlock title="차별화 포인트" items={data.differentiation} />
      <ListBlock title="유의사항" items={data.cautions} />
    </div>
  );
}

function AdStrategyView({ data }: { data: AdStrategyOutput }) {
  return (
    <div className="flex flex-col gap-2">
      <p>캠페인 목표: {data.campaignObjective} / 추천 광고유형: {data.recommendedAdType}</p>
      <p>일 예산: {formatKrw(data.dailyBudget)} / 목표 ROAS: {data.targetRoas}%</p>
      <ListBlock title="중단 기준" items={data.stopCriteria} />
      <ListBlock title="확대 기준" items={data.scaleCriteria} />
      <ListBlock title="유의사항" items={data.cautions} />
    </div>
  );
}

function QaView({ data }: { data: QaOutput }) {
  return (
    <div className="flex flex-col gap-2">
      <p>종합 품질 점수: {data.overallQualityScore} / 통과 여부: {data.pass ? '통과' : '미통과'}</p>
      <ListBlock title="패키지 생성 전 필수 수정 항목" items={data.mustFixBeforePackage} />
      <ListBlock title="개선 제안" items={data.suggestedImprovements} />
      <p className="text-xs text-slate-500">{data.finalNote}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <ul className="list-disc space-y-0.5 pl-5 text-sm text-slate-600">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
