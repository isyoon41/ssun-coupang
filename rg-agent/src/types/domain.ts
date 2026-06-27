export type ProjectStatus =
  | 'draft'
  | 'source_added'
  | 'analyzing'
  | 'analysis_done'
  | 'risk_review'
  | 'content_drafted'
  | 'user_review'
  | 'revision_requested'
  | 'approved'
  | 'listing_pack_ready'
  | 'listed'
  | 'inbound_ready'
  | 'inbound_sent'
  | 'live'
  | 'ad_testing'
  | 'scale'
  | 'hold'
  | 'discarded';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationGrade = 'A' | 'B' | 'C' | 'D' | 'E';
export type OutputStatus = 'draft' | 'approved' | 'revision_requested' | 'rejected' | 'locked';
export type SourcePlatform =
  | 'domeme'
  | 'coupang'
  | 'smartstore'
  | 'taobao'
  | 'alpha1688'
  | 'manual'
  | 'other';

export type AgentType =
  | 'intake'
  | 'product_analysis'
  | 'risk'
  | 'market_strategy'
  | 'seo'
  | 'creative'
  | 'pricing'
  | 'rocketgrowth_ops'
  | 'ad_strategy'
  | 'qa'
  | 'packager';

export interface ProjectListItem {
  id: string;
  title: string;
  status: ProjectStatus | string;
  riskLevel?: RiskLevel | string | null;
  recommendationGrade?: RecommendationGrade | string | null;
  recommendedPrice?: number | null;
  expectedMarginRate?: number | null;
  createdAt: string;
}

export interface ProductInput {
  sourceUrl?: string;
  sourcePlatform?: SourcePlatform;
  rawProductName: string;
  rawDescription?: string;
  categoryHint?: string;
  supplyPrice?: number;
  domesticShippingCost?: number;
  imageUrls?: string[];
  memo?: string;
}

export interface IntakeOutput {
  normalizedProductName: string;
  sourcePlatform: string;
  detectedCategory: string | null;
  priceInfo: {
    supplyPrice: number | null;
    domesticShippingCost: number | null;
  };
  availableData: string[];
  missingData: string[];
  fallbackInstructions: string[];
  notes: string[];
}

export interface ProductAnalysisOutput {
  oneLineSummary: string;
  mainFeatures: string[];
  materialAndForm?: string;
  useCases: string[];
  targetCustomers: string[];
  painPoints: string[];
  purchaseTriggers: string[];
  purchaseBarriers: string[];
  visualSellingPoints: string[];
  detailPageMessage: string;
  sellingDifficulty: 'low' | 'medium' | 'high';
  recommendationGrade: RecommendationGrade;
  recommendationReason: string;
  cautions: string[];
}

export interface RiskItem {
  level: RiskLevel;
  title: string;
  description: string;
  actionRequired: string;
}

export interface RiskOutput {
  overallRiskLevel: RiskLevel;
  ipRisks: RiskItem[];
  adExpressionRisks: RiskItem[];
  certificationRisks: RiskItem[];
  imageCopyrightRisks: RiskItem[];
  prohibitedExpressions: string[];
  replacementExpressions: { original: string; replacement: string }[];
  kiprisSearchKeywords: string[];
  finalWarning: string;
}

export interface MarketStrategyOutput {
  positioningStatement: string;
  coreSellingPoints: string[];
  targetMessages: { target: string; message: string }[];
  purchaseTriggers: string[];
  objectionHandling: { concern: string; response: string }[];
  detailPageFlow: string[];
  reviewPromptPoints: string[];
  differentiation: string[];
  cautions: string[];
}

export interface SeoOutput {
  titleCandidates: string[];
  recommendedTitle: string;
  titleRationale: string;
  mainKeywords: string[];
  relatedKeywords: string[];
  longtailKeywords: string[];
  brandConceptKeywords: string[];
  searchTags20: string[];
  excludedKeywords: string[];
  cautions: string[];
}

export interface ThumbnailConcept {
  title: string;
  concept: string;
  visualDirection: string;
  mainCopy?: string;
  cautions: string[];
}

export interface DetailPageSection {
  order: number;
  title: string;
  body: string;
  imageGuide: string;
  riskNote?: string;
}

export interface CreativeOutput {
  thumbnailConcepts: ThumbnailConcept[];
  detailPageSections: DetailPageSection[];
  detailPageMarkdown: string;
  detailPageHtml: string;
  adCopies: string[];
  bannerCopies: string[];
  imagePrompts: string[];
  videoScript?: string;
  cautions: string[];
}

export interface PricingInput {
  supplyPrice: number;
  domesticShippingCost: number;
  overseasShippingCost: number;
  customsCost: number;
  packagingCost: number;
  otherCost: number;
  coupangFeeRate: number;
  fulfillmentFee: number;
  storageFeeEstimate: number;
  returnFeeEstimate: number;
  adCostEstimate: number;
  targetMarginRate: number;
}

export interface PricingCalcOutput {
  recommendedPrice: number;
  minimumPrice: number;
  adSafePrice: number;
  expectedProfit: number;
  expectedMarginRate: number;
  breakevenQuantity: number;
  recommendedInboundQty: number;
  totalInitialCost: number;
  warnings: string[];
  formula: Record<string, unknown>;
}

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  required: boolean;
  completed: boolean;
  riskLevel?: RiskLevel;
}

export interface OpsChecklistOutput {
  inboundRecommendation: string;
  recommendedInboundQty: number;
  checklist: ChecklistItem[];
  highRiskItems: string[];
  cautions: string[];
}

export interface AdStrategyOutput {
  campaignObjective: string;
  recommendedAdType: string;
  campaignName: string;
  dailyBudget: number;
  targetRoas: number;
  operationPeriodDays: number;
  stopCriteria: string[];
  scaleCriteria: string[];
  negativeKeywordCandidates: string[];
  reviewChecklist: string[];
  cautions: string[];
}

export interface QaIssue {
  area: string;
  severity: RiskLevel;
  issue: string;
  recommendation: string;
}

export interface QaOutput {
  overallQualityScore: number;
  pass: boolean;
  issues: QaIssue[];
  mustFixBeforePackage: string[];
  suggestedImprovements: string[];
  finalNote: string;
}

export interface PackagerOutput {
  packageTitle: string;
  warnings: string[];
  listingFields: {
    productTitle: string;
    categoryCandidate: string;
    searchTags20: string[];
    salePrice: number;
    options: string[];
    shortDescription: string;
  };
  detailPage: {
    markdown: string;
    html: string;
  };
  creative: {
    thumbnailConcepts: string[];
    imagePrompts: string[];
  };
  ad: {
    adCopies: string[];
    adStrategy: string;
  };
  pricing: Record<string, unknown>;
  riskChecklist: string[];
  inboundChecklist: string[];
  markdownPackage: string;
  htmlPackage: string;
}
