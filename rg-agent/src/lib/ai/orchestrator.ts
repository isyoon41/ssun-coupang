import { prisma } from '@/lib/prisma';
import type { ProductInput, PricingInput } from '@/types/domain';
import { DEFAULT_PRICING_INPUT } from '@/lib/pricing/calculator';
import { runIntakeAgent } from './agents/intake';
import { runProductAnalysisAgent } from './agents/product-analysis';
import { runRiskAgent } from './agents/risk';
import { runMarketStrategyAgent } from './agents/market-strategy';
import { runSeoAgent } from './agents/seo';
import { runCreativeAgent } from './agents/creative';
import { runPricingAgent } from './agents/pricing';
import { runRocketGrowthOpsAgent } from './agents/rocketgrowth-ops';
import { runAdStrategyAgent } from './agents/ad-strategy';
import { runQaAgent } from './agents/qa';
import type { AgentType, ProjectStatus } from '@/types/domain';

function toProductInput(project: {
  rawProductName: string | null;
  rawDescription: string | null;
  categoryHint: string | null;
  supplyPrice: number | null;
  domesticShippingCost: number | null;
  sourceUrl: string | null;
  sourcePlatform: string;
  imageUrls: string | null;
  memo: string | null;
}): ProductInput {
  return {
    sourceUrl: project.sourceUrl ?? undefined,
    sourcePlatform: project.sourcePlatform as ProductInput['sourcePlatform'],
    rawProductName: project.rawProductName ?? '',
    rawDescription: project.rawDescription ?? undefined,
    categoryHint: project.categoryHint ?? undefined,
    supplyPrice: project.supplyPrice ?? undefined,
    domesticShippingCost: project.domesticShippingCost ?? undefined,
    imageUrls: project.imageUrls ? (JSON.parse(project.imageUrls) as string[]) : undefined,
    memo: project.memo ?? undefined,
  };
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  await prisma.productProject.update({ where: { id: projectId }, data: { status } });
}

export async function saveAiOutput(
  projectId: string,
  agentType: AgentType,
  outputJson: unknown,
  opts?: { title?: string; outputType?: string },
) {
  return prisma.aiOutput.create({
    data: {
      projectId,
      agentType,
      outputType: opts?.outputType ?? agentType,
      title: opts?.title,
      outputJson: JSON.stringify(outputJson),
      modelName: process.env.AI_PROVIDER === 'google' ? (process.env.GOOGLE_AI_MODEL ?? 'gemini-2.0-flash') : 'mock-provider-v1',
      promptVersion: 'v1.0',
      status: 'draft',
    },
  });
}

export async function savePricingOutput(projectId: string, input: PricingInput, output: Awaited<ReturnType<typeof runPricingAgent>>) {
  return prisma.pricingOutput.create({
    data: {
      projectId,
      ...input,
      recommendedPrice: output.recommendedPrice,
      minimumPrice: output.minimumPrice,
      adSafePrice: output.adSafePrice,
      expectedProfit: output.expectedProfit,
      expectedMarginRate: output.expectedMarginRate,
      breakevenQuantity: output.breakevenQuantity,
      recommendedInboundQty: output.recommendedInboundQty,
      totalInitialCost: output.totalInitialCost,
      formulaJson: JSON.stringify(output.formula),
    },
  });
}

export async function saveChecklist(
  projectId: string,
  checklistType: string,
  title: string,
  items: { id: string; label: string; completed: boolean }[],
) {
  const completionRate = items.length ? (items.filter((i) => i.completed).length / items.length) * 100 : 0;
  return prisma.checklist.create({
    data: { projectId, checklistType, title, items: JSON.stringify(items), completionRate },
  });
}

export async function runFullAnalysis(projectId: string) {
  await updateProjectStatus(projectId, 'analyzing');

  const project = await prisma.productProject.findUniqueOrThrow({ where: { id: projectId } });
  const productInput = toProductInput(project);

  const intake = await runIntakeAgent(productInput);
  await saveAiOutput(projectId, 'intake', intake);

  const analysis = await runProductAnalysisAgent(productInput);
  await saveAiOutput(projectId, 'product_analysis', analysis, { title: '상품 분석' });

  const risk = await runRiskAgent(productInput);
  await saveAiOutput(projectId, 'risk', risk, { title: '리스크 점검' });

  await updateProjectStatus(projectId, 'risk_review');

  const strategy = await runMarketStrategyAgent(productInput);
  await saveAiOutput(projectId, 'market_strategy', strategy, { title: '마케팅 전략' });

  const seo = await runSeoAgent(productInput);
  await saveAiOutput(projectId, 'seo', seo, { title: 'SEO 상품명/태그' });

  const creative = await runCreativeAgent(productInput);
  await saveAiOutput(projectId, 'creative', creative, { title: '상세페이지/광고 콘텐츠' });

  await updateProjectStatus(projectId, 'content_drafted');

  const pricingInput: PricingInput = {
    ...DEFAULT_PRICING_INPUT,
    supplyPrice: project.supplyPrice ?? 0,
    domesticShippingCost: project.domesticShippingCost ?? 0,
  };
  const pricing = await runPricingAgent(pricingInput);
  await savePricingOutput(projectId, pricingInput, pricing);

  const ops = await runRocketGrowthOpsAgent(productInput);
  await saveChecklist(projectId, 'rocketgrowth_inbound', '로켓그로스 입고 체크리스트', ops.checklist);
  await saveAiOutput(projectId, 'rocketgrowth_ops', ops, { title: '입고 체크리스트(원본)' });

  const ad = await runAdStrategyAgent(productInput);
  await saveAiOutput(projectId, 'ad_strategy', ad, { title: '광고 전략' });

  const qa = await runQaAgent(productInput);
  await saveAiOutput(projectId, 'qa', qa, { title: 'QA 검수' });

  await prisma.productProject.update({
    where: { id: projectId },
    data: {
      status: 'user_review',
      riskLevel: risk.overallRiskLevel,
      recommendationGrade: analysis.recommendationGrade,
      expectedMarginRate: pricing.expectedMarginRate,
      recommendedPrice: pricing.recommendedPrice,
      categoryCandidate: project.categoryHint ?? undefined,
    },
  });

  return { intake, analysis, risk, strategy, seo, creative, pricing, ops, ad, qa };
}

export async function runSingleAgent(projectId: string, agentType: AgentType) {
  const project = await prisma.productProject.findUniqueOrThrow({ where: { id: projectId } });
  const productInput = toProductInput(project);

  switch (agentType) {
    case 'intake':
      return saveAiOutput(projectId, agentType, await runIntakeAgent(productInput));
    case 'product_analysis':
      return saveAiOutput(projectId, agentType, await runProductAnalysisAgent(productInput), { title: '상품 분석' });
    case 'risk':
      return saveAiOutput(projectId, agentType, await runRiskAgent(productInput), { title: '리스크 점검' });
    case 'market_strategy':
      return saveAiOutput(projectId, agentType, await runMarketStrategyAgent(productInput), { title: '마케팅 전략' });
    case 'seo':
      return saveAiOutput(projectId, agentType, await runSeoAgent(productInput), { title: 'SEO 상품명/태그' });
    case 'creative':
      return saveAiOutput(projectId, agentType, await runCreativeAgent(productInput), { title: '상세페이지/광고 콘텐츠' });
    case 'rocketgrowth_ops': {
      const ops = await runRocketGrowthOpsAgent(productInput);
      await saveChecklist(projectId, 'rocketgrowth_inbound', '로켓그로스 입고 체크리스트', ops.checklist);
      return saveAiOutput(projectId, agentType, ops, { title: '입고 체크리스트(원본)' });
    }
    case 'ad_strategy':
      return saveAiOutput(projectId, agentType, await runAdStrategyAgent(productInput), { title: '광고 전략' });
    case 'qa':
      return saveAiOutput(projectId, agentType, await runQaAgent(productInput), { title: 'QA 검수' });
    default:
      throw new Error(`개별 실행을 지원하지 않는 agentType 입니다: ${agentType}`);
  }
}
