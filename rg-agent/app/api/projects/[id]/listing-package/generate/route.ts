import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/types/api';
import { runPackagerAgent } from '@/lib/ai/agents/packager';
import { buildCsvPackage } from '@/lib/packages/csv';
import type {
  SeoOutput,
  CreativeOutput,
  AdStrategyOutput,
  OpsChecklistOutput,
  RiskOutput,
  PricingCalcOutput,
} from '@/types/domain';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.productProject.findUnique({ where: { id: params.id } });
  if (!project) {
    return NextResponse.json(fail('NOT_FOUND', '프로젝트를 찾을 수 없습니다.'), { status: 404 });
  }

  // 승인된(approved) AiOutput 만 패키지에 반영한다 — Human-in-the-loop 핵심 규칙(스펙 5.1).
  const outputs = await prisma.aiOutput.findMany({ where: { projectId: params.id, status: 'approved' } });
  const approvedOutputTypes = new Set<string>(outputs.map((o) => o.outputType));
  const byType = new Map<string, unknown>(outputs.map((o) => [o.outputType, JSON.parse(o.outputJson)]));

  const latestRisk = await prisma.aiOutput.findFirst({
    where: { projectId: params.id, agentType: 'risk' },
    orderBy: { createdAt: 'desc' },
  });
  const latestPricing = await prisma.pricingOutput.findFirst({
    where: { projectId: params.id },
    orderBy: { createdAt: 'desc' },
  });

  if (approvedOutputTypes.size === 0) {
    return NextResponse.json(
      fail('NO_APPROVED_OUTPUTS', '승인된 산출물이 없어 등록 패키지를 생성할 수 없습니다.'),
      { status: 400 },
    );
  }

  const packagerOutput = await runPackagerAgent({
    projectTitle: project.title,
    categoryCandidate: project.categoryCandidate ?? project.categoryHint ?? undefined,
    seo: byType.get('seo') as SeoOutput | undefined,
    creative: byType.get('creative') as CreativeOutput | undefined,
    ad: byType.get('ad_strategy') as AdStrategyOutput | undefined,
    ops: byType.get('rocketgrowth_ops') as OpsChecklistOutput | undefined,
    risk: latestRisk ? (JSON.parse(latestRisk.outputJson) as RiskOutput) : undefined,
    pricing: latestPricing
      ? ({
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
        } as PricingCalcOutput)
      : undefined,
    approvedOutputTypes,
  });

  const csvContent = buildCsvPackage({ listingFields: packagerOutput.listingFields });

  const listingPackage = await prisma.listingPackage.create({
    data: {
      projectId: params.id,
      title: packagerOutput.packageTitle,
      packageJson: JSON.stringify(packagerOutput),
      markdownContent: packagerOutput.markdownPackage,
      htmlContent: packagerOutput.htmlPackage,
      csvContent,
    },
  });

  await prisma.productProject.update({ where: { id: params.id }, data: { status: 'listing_pack_ready' } });

  return NextResponse.json(
    ok({ listingPackageId: listingPackage.id, markdownAvailable: true, htmlAvailable: true, jsonAvailable: true }),
  );
}
