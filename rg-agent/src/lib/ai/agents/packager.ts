import { buildMarkdownPackage } from '@/lib/packages/markdown';
import { buildHtmlPackage } from '@/lib/packages/html';
import type { PackagerOutput, SeoOutput, CreativeOutput, AdStrategyOutput, OpsChecklistOutput, RiskOutput, PricingCalcOutput } from '@/types/domain';

export interface PackagerInput {
  projectTitle: string;
  categoryCandidate?: string;
  seo?: SeoOutput;
  creative?: CreativeOutput;
  ad?: AdStrategyOutput;
  ops?: OpsChecklistOutput;
  risk?: RiskOutput;
  pricing?: PricingCalcOutput;
  approvedOutputTypes: Set<string>;
}

// Packager 는 "승인된 산출물만" 패키지에 포함한다(스펙 5.1, 13.12).
export async function runPackagerAgent(input: PackagerInput): Promise<PackagerOutput> {
  const warnings: string[] = [];
  if (input.risk && (input.risk.overallRiskLevel === 'high' || input.risk.overallRiskLevel === 'critical')) {
    warnings.push(`리스크 등급이 ${input.risk.overallRiskLevel.toUpperCase()} 입니다. 등록 전 반드시 직접 재확인하세요.`);
  }

  const seoApproved = input.approvedOutputTypes.has('seo') ? input.seo : undefined;
  const creativeApproved = input.approvedOutputTypes.has('creative') ? input.creative : undefined;
  const adApproved = input.approvedOutputTypes.has('ad_strategy') ? input.ad : undefined;
  const opsApproved = input.approvedOutputTypes.has('rocketgrowth_ops') ? input.ops : undefined;

  const listingFields = {
    productTitle: seoApproved?.recommendedTitle ?? input.projectTitle,
    categoryCandidate: input.categoryCandidate ?? '확인 필요',
    searchTags20: seoApproved?.searchTags20 ?? [],
    salePrice: input.pricing?.recommendedPrice ?? 0,
    options: [],
    shortDescription: creativeApproved?.detailPageSections?.[0]?.body ?? '',
  };

  if (!seoApproved) warnings.push('SEO 산출물이 승인되지 않아 상품명/태그가 비어있을 수 있습니다.');
  if (!creativeApproved) warnings.push('Creative 산출물이 승인되지 않아 상세페이지가 비어있을 수 있습니다.');

  const markdownPackage = buildMarkdownPackage({
    projectTitle: input.projectTitle,
    warnings,
    listingFields,
    detailPageMarkdown: creativeApproved?.detailPageMarkdown,
    adCopies: adApproved ? creativeApproved?.adCopies : undefined,
    imagePrompts: creativeApproved?.imagePrompts,
    riskChecklist: input.risk ? [input.risk.finalWarning, ...input.risk.prohibitedExpressions] : [],
    inboundChecklist: opsApproved?.checklist.map((c) => c.label) ?? [],
  });

  const htmlPackage = buildHtmlPackage({
    projectTitle: input.projectTitle,
    warnings,
    listingFields,
    detailPageHtml: creativeApproved?.detailPageHtml,
    adCopies: adApproved ? creativeApproved?.adCopies : undefined,
  });

  return {
    packageTitle: `쿠팡 등록 패키지: ${input.projectTitle}`,
    warnings,
    listingFields,
    detailPage: {
      markdown: creativeApproved?.detailPageMarkdown ?? '',
      html: creativeApproved?.detailPageHtml ?? '',
    },
    creative: {
      thumbnailConcepts: creativeApproved?.thumbnailConcepts.map((t) => t.title) ?? [],
      imagePrompts: creativeApproved?.imagePrompts ?? [],
    },
    ad: {
      adCopies: creativeApproved?.adCopies ?? [],
      adStrategy: adApproved?.recommendedAdType ?? '확인 필요',
    },
    pricing: (input.pricing as unknown as Record<string, unknown>) ?? {},
    riskChecklist: input.risk ? [input.risk.finalWarning, ...input.risk.prohibitedExpressions] : [],
    inboundChecklist: opsApproved?.checklist.map((c) => c.label) ?? [],
    markdownPackage,
    htmlPackage,
  };
}
