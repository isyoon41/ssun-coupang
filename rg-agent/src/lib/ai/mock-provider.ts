import type { AiProvider, RunAgentParams } from './provider';
import type {
  ProductInput,
  IntakeOutput,
  ProductAnalysisOutput,
  RiskOutput,
  MarketStrategyOutput,
  SeoOutput,
  CreativeOutput,
  OpsChecklistOutput,
  AdStrategyOutput,
  QaOutput,
} from '@/types/domain';

const BRAND_WATCHLIST = ['나이키', '아디다스', '애플', '삼성', '루이비통', '구찌', '디즈니', '카카오프렌즈'];
const HYPE_WORDS = ['최고', '1위', '완벽', '무조건', '100%', '보장', '특허받은', '유일'];

function buildIntake(input: ProductInput): IntakeOutput {
  const missingData: string[] = [];
  if (!input.supplyPrice) missingData.push('supplyPrice');
  if (!input.imageUrls?.length) missingData.push('imageUrls');
  if (!input.categoryHint) missingData.push('categoryHint');

  return {
    normalizedProductName: input.rawProductName.trim(),
    sourcePlatform: input.sourcePlatform ?? 'manual',
    detectedCategory: input.categoryHint ?? null,
    priceInfo: {
      supplyPrice: input.supplyPrice ?? null,
      domesticShippingCost: input.domesticShippingCost ?? null,
    },
    availableData: ['rawProductName', input.rawDescription ? 'rawDescription' : undefined].filter(
      Boolean,
    ) as string[],
    missingData,
    fallbackInstructions: missingData.length
      ? [`다음 항목이 비어 있어 분석 정확도가 낮아질 수 있습니다(추정값 사용): ${missingData.join(', ')}`]
      : [],
    notes: ['이 결과는 Mock Agent가 생성한 표준화 결과입니다.'],
  };
}

function buildProductAnalysis(input: ProductInput): ProductAnalysisOutput {
  const name = input.rawProductName;
  const hasBrandRisk = BRAND_WATCHLIST.some((b) => name.includes(b) || (input.rawDescription ?? '').includes(b));

  return {
    oneLineSummary: `${name}: ${input.categoryHint ?? '카테고리 확인 필요'} 카테고리의 상품으로 추정됩니다(추정).`,
    mainFeatures: [
      '핵심 기능은 원본 설명 기반 추정이며, 실제 상세페이지 작성 전 검증이 필요합니다.',
      input.rawDescription ? input.rawDescription.slice(0, 60) : '상품 설명이 입력되지 않아 기능 추정이 제한적입니다.',
    ],
    materialAndForm: '소재/형태 정보는 원본 데이터에 명시되지 않아 추정입니다.',
    useCases: ['일상 사용', '선물용(추정)'],
    targetCustomers: ['가격에 민감한 20~40대 온라인 구매자(추정)'],
    painPoints: ['기존 상품의 불편함 해소를 기대하는 고객(추정)'],
    purchaseTriggers: ['가격 대비 효용', '리뷰 신뢰도'],
    purchaseBarriers: ['실제 사용 후기 부족에 대한 우려', '사이즈/규격 불확실성'],
    visualSellingPoints: ['실사용 장면 이미지', '비교 컷'],
    detailPageMessage: `${name}, 문제 해결형 메시지로 구성 추천(추정)`,
    sellingDifficulty: hasBrandRisk ? 'high' : 'medium',
    recommendationGrade: hasBrandRisk ? 'C' : 'B',
    recommendationReason: hasBrandRisk
      ? '브랜드명 포함 가능성으로 리스크 검토 후 등록을 권장합니다.'
      : '소량 테스트 후 반응을 보고 확대하는 것을 권장합니다.',
    cautions: ['본 분석은 AI 추정이며 판매를 보장하지 않습니다.'],
  };
}

function buildRisk(input: ProductInput): RiskOutput {
  const text = `${input.rawProductName} ${input.rawDescription ?? ''}`;
  const brandHits = BRAND_WATCHLIST.filter((b) => text.includes(b));
  const hypeHits = HYPE_WORDS.filter((w) => text.includes(w));

  const ipRisks = brandHits.map((b) => ({
    level: 'high' as const,
    title: `브랜드명 "${b}" 포함 가능성`,
    description: `상품명/설명에 "${b}" 가 포함되어 상표권 또는 브랜드 오인 리스크가 있을 수 있습니다(1차 점검).`,
    actionRequired: '브랜드명을 제거하거나 정식 라이선스 여부를 확인하세요.',
  }));

  const adExpressionRisks = hypeHits.map((w) => ({
    level: 'medium' as const,
    title: `과장 표현 "${w}" 사용 가능성`,
    description: `"${w}" 표현은 표시광고법상 과장광고로 간주될 수 있습니다(1차 점검).`,
    actionRequired: '객관적 근거가 없다면 표현을 완화하세요.',
  }));

  const overall =
    ipRisks.length > 0 ? 'high' : adExpressionRisks.length > 0 ? 'medium' : 'low';

  return {
    overallRiskLevel: overall,
    ipRisks,
    adExpressionRisks,
    certificationRisks: [
      {
        level: 'low',
        title: '인증 필요 가능성 확인 필요',
        description: '전기/유아/식품 등 카테고리는 KC 인증 등이 필요할 수 있습니다(확인 필요).',
        actionRequired: '카테고리 확정 후 인증 요건을 별도 확인하세요.',
      },
    ],
    imageCopyrightRisks: [
      {
        level: 'low',
        title: '이미지 저작권 확인 필요',
        description: '공급처 제공 이미지를 그대로 사용할 경우 저작권 확인이 필요합니다(확인 필요).',
        actionRequired: '자체 촬영 또는 사용 권한이 명확한 이미지 사용을 권장합니다.',
      },
    ],
    prohibitedExpressions: hypeHits,
    replacementExpressions: hypeHits.map((w) => ({ original: w, replacement: '많은 고객이 선택한(예시)' })),
    kiprisSearchKeywords: brandHits.length ? brandHits : [input.rawProductName.split(' ')[0]],
    finalWarning: '본 결과는 AI 기반 1차 점검이며, 최종 법률·인증·정책 판단은 사용자가 직접 확인해야 합니다.',
  };
}

function buildMarketStrategy(input: ProductInput): MarketStrategyOutput {
  return {
    positioningStatement: `${input.rawProductName}, 일상의 불편함을 줄여주는 합리적 선택(추정 포지셔닝)`,
    coreSellingPoints: [
      '가격 대비 합리적 품질(추정)',
      '간편한 사용성(추정)',
      '실생활 밀착형 효용(추정)',
      '빠른 배송(로켓그로스)',
      '안심 교환/반품(쿠팡 정책 기반)',
    ],
    targetMessages: [
      { target: '가격 민감 고객', message: '합리적인 가격으로 효용을 경험하세요(예시 문구, 검증 필요)' },
      { target: '편의 중시 고객', message: '복잡한 과정 없이 바로 사용 가능합니다(예시 문구, 검증 필요)' },
    ],
    purchaseTriggers: ['리뷰/평점', '로켓그로스 빠른 배송 뱃지'],
    objectionHandling: [
      { concern: '실제 품질이 사진과 다를까 우려', response: '실사용 컷과 상세 치수를 상세페이지에 포함하세요.' },
    ],
    detailPageFlow: ['문제 제기', '해결책 제시', '핵심 기능', '사용 장면', '비교/차별화', '구매 유도'],
    reviewPromptPoints: ['포토리뷰 유도 문구', '사용 1주 후 후기 요청'],
    differentiation: ['차별화 포인트는 경쟁상품 비교 데이터 확보 후 보강 필요(추정)'],
    cautions: ['단정적 효능 표현은 사용하지 않았습니다. 실제 등록 전 사실관계를 재확인하세요.'],
  };
}

function buildSeo(input: ProductInput): SeoOutput {
  const base = input.rawProductName.replace(/[^가-힣a-zA-Z0-9 ]/g, '').trim();
  const tokens = base.split(/\s+/).filter(Boolean);
  const main = tokens.slice(0, 4);
  const related = ['가성비', '추천', '실용', '데일리', '선물', '인기', '여름', '신상'];
  const longtail = main.map((t) => `${t} 추천템`).concat([`${base} 후기`, `${base} 가격비교`]);
  const brandConcept = ['데일리룩', '국내배송', '당일출고', '로켓배송'];

  const searchTags20 = Array.from(
    new Set([...main, ...related, ...longtail, ...brandConcept]),
  ).slice(0, 20);
  while (searchTags20.length < 20) {
    searchTags20.push(`${base} 키워드${searchTags20.length + 1}`);
  }

  return {
    titleCandidates: [
      `${base} 데일리 추천`,
      `${base} 실용 가성비`,
      `${base} 인기 상품`,
      `${base} 국내배송`,
      base,
    ],
    recommendedTitle: `${base} 데일리 추천`,
    titleRationale: '핵심 키워드를 전방에 배치하고 과장/특수문자를 배제했습니다.',
    mainKeywords: main,
    relatedKeywords: related,
    longtailKeywords: longtail,
    brandConceptKeywords: brandConcept,
    searchTags20,
    excludedKeywords: BRAND_WATCHLIST,
    cautions: ['브랜드명/과장 표현은 태그에서 제외했습니다.'],
  };
}

function buildCreative(input: ProductInput): CreativeOutput {
  const name = input.rawProductName;
  const sections = [
    { order: 1, title: '문제 제기', body: `이런 불편함, 한 번쯔 겪어보셨나요? (${name})`, imageGuide: '문제 상황 이미지' },
    { order: 2, title: '상품의 해결책', body: `${name}이 이 문제를 해결해 드립니다(추정).`, imageGuide: '제품 메인 컷' },
    { order: 3, title: '핵심 기능', body: '핵심 기능을 3~4가지로 요약해 보여주세요.', imageGuide: '기능 다이어그램' },
    { order: 4, title: '사용 장면', body: '실제 사용 장면을 보여주세요.', imageGuide: '실사용 컷' },
    { order: 5, title: '소재·사이즈·옵션', body: '소재, 사이즈, 옵션 정보를 표로 정리하세요.', imageGuide: '규격표' },
    { order: 6, title: '비교/차별화', body: '경쟁 상품과의 차이를 객관적으로 비교하세요.', imageGuide: '비교 테이블' },
    { order: 7, title: '구매 전 우려 해소', body: 'Q&A 형식으로 우려를 해소하세요.', imageGuide: 'FAQ 텍스트 카드' },
    { order: 8, title: '사용법', body: '간단한 사용 순서를 안내하세요.', imageGuide: '스텝 일러스트' },
    { order: 9, title: '배송·반품 안내', body: '로켓그로스 배송 및 쿠팡 반품 정책을 안내하세요.', imageGuide: '정책 안내 텍스트' },
    { order: 10, title: '구매 유도', body: '지금 구매 시 받을 수 있는 혜택을 안내하세요(과장 금지).', imageGuide: 'CTA 배너' },
  ];

  const detailPageMarkdown = sections
    .map((s) => `## ${s.order}. ${s.title}\n\n${s.body}`)
    .join('\n\n');
  const detailPageHtml = sections
    .map((s) => `<section><h2>${s.order}. ${s.title}</h2><p>${s.body}</p></section>`)
    .join('\n');

  return {
    thumbnailConcepts: [
      { title: '메인 정면컷', concept: '제품을 정면에서 크게 보여주는 컷', visualDirection: '화이트 배경, 정사각형', mainCopy: name, cautions: ['워터마크/타사로고 금지'] },
      { title: '사용 장면컷', concept: '실생활 사용 장면', visualDirection: '자연광, 생활 공간', cautions: ['과도한 텍스트 금지'] },
      { title: '구성품컷', concept: '구성품 전체 배치', visualDirection: '플랫레이', cautions: [] },
      { title: '비교컷', concept: '전/후 또는 사용 전후 비교', visualDirection: '2분할 구도', cautions: ['과장 표현 금지'] },
      { title: '디테일컷', concept: '소재/마감 디테일 확대', visualDirection: '클로즈업', cautions: [] },
    ],
    detailPageSections: sections,
    detailPageMarkdown,
    detailPageHtml,
    adCopies: [
      `${name}, 지금 확인해보세요`,
      '리뷰로 증명하는 만족도',
      '오늘 주문하면 빠르게 받아보세요',
      '가성비 좋은 선택',
      '데일리로 사용하기 좋은 아이템',
      '실용성을 더한 상품',
      '간단하지만 확실한 효용',
      '합리적인 가격, 확실한 품질(검증 필요)',
      '선물하기도 좋은 상품',
      '지금 만나보세요',
    ],
    bannerCopies: ['오늘의 추천', '데일리 인기템', '실속있는 선택', '지금 바로 확인', '한정 수량 테스트 판매'],
    imagePrompts: [
      `${name} product photo, white background, studio lighting, square crop`,
      `${name} lifestyle usage scene, natural light`,
      `${name} flat lay with accessories`,
      `${name} close-up detail shot`,
      `${name} before-after comparison, no exaggerated claims`,
    ],
    videoScript: `[0-3초] 문제 제기 → [3-8초] ${name} 등장 → [8-15초] 핵심 기능 → [15-20초] CTA`,
    cautions: ['모바일 가독성을 우선 검토하세요.', '과장 광고 표현이 없는지 최종 확인하세요.'],
  };
}

function buildOpsChecklist(): OpsChecklistOutput {
  const items: OpsChecklistOutput['checklist'] = [
    { id: 'wing_listing', label: '쿠팡 WING 상품 등록 확인', required: true, completed: false, riskLevel: 'high' },
    { id: 'rocket_growth_select', label: '로켓그로스 배송 이용 선택 확인', required: true, completed: false, riskLevel: 'high' },
    { id: 'inbound_create', label: '입고 생성', required: true, completed: false, riskLevel: 'medium' },
    { id: 'inbound_qty', label: '입고 수량 확인', required: true, completed: false, riskLevel: 'high' },
    { id: 'box_qty', label: '박스당 수량 확인', required: true, completed: false, riskLevel: 'medium' },
    { id: 'inbound_date', label: '입고 예정일 확인', required: true, completed: false, riskLevel: 'low' },
    { id: 'shipping_method', label: '택배/밀크런/트럭 선택', required: true, completed: false, riskLevel: 'low' },
    { id: 'barcode_download', label: '쿠팡 바코드 다운로드', required: true, completed: false, riskLevel: 'high' },
    { id: 'barcode_attach', label: '개별 상품 바코드 부착', required: true, completed: false, riskLevel: 'critical' },
    { id: 'barcode_check', label: '바코드 훼손 여부 확인', required: true, completed: false, riskLevel: 'high' },
    { id: 'sku_pack', label: '동일 SKU 박스 포장', required: true, completed: false, riskLevel: 'medium' },
    { id: 'doc_attach', label: '물류부착 문서 출력', required: true, completed: false, riskLevel: 'high' },
    { id: 'doc_enclose', label: '물류동봉 문서 출력', required: true, completed: false, riskLevel: 'high' },
    { id: 'invoice_attach', label: '송장 부착', required: true, completed: false, riskLevel: 'medium' },
    { id: 'ship_complete', label: '발송 완료', required: true, completed: false, riskLevel: 'low' },
    { id: 'inbound_status', label: '입고 상태 확인', required: true, completed: false, riskLevel: 'low' },
  ];

  return {
    inboundRecommendation: '초보 셀러는 소량(5~10개) 테스트 입고를 권장합니다.',
    recommendedInboundQty: 10,
    checklist: items,
    highRiskItems: items.filter((i) => i.riskLevel === 'high' || i.riskLevel === 'critical').map((i) => i.label),
    cautions: ['바코드 누락, 수량 불일치, 문서 누락 시 입고가 반송/회송될 수 있습니다.'],
  };
}

function buildAdStrategy(): AdStrategyOutput {
  return {
    campaignObjective: '상품 검증을 위한 초기 광고 테스트',
    recommendedAdType: '쿠팡 자동 광고(매뉴얼 키워드 확대 전 단계)',
    campaignName: '신규 상품 테스트 캠페인',
    dailyBudget: 10000,
    targetRoas: 350,
    operationPeriodDays: 14,
    stopCriteria: ['7일간 ROAS 150% 미달 시 중단 검토', '클릭 대비 전환 0건이 100클릭 이상 지속 시 중단'],
    scaleCriteria: ['ROAS 350% 이상 3일 연속 유지 시 예산 20%씩 증액'],
    negativeKeywordCandidates: ['무료', '중고', '체험단'],
    reviewChecklist: ['2주 후 키워드별 성과 리뷰', '저성과 키워드 제외 처리', '예산 재배분 검토'],
    cautions: ['마진이 낮은 상품은 광고비가 손실로 이어질 수 있으니 보수적으로 운영하세요.'],
  };
}

function buildQa(): QaOutput {
  return {
    overallQualityScore: 78,
    pass: true,
    issues: [
      {
        area: '상세페이지',
        severity: 'low',
        issue: '일부 문구가 일반적인 예시 톤으로 작성되어 상품 고유 특성 반영이 부족합니다.',
        recommendation: '실제 상품 특징을 반영하여 문구를 보강하세요.',
      },
    ],
    mustFixBeforePackage: [],
    suggestedImprovements: ['리뷰 유도 문구 추가', '경쟁상품 비교 데이터 보강'],
    finalNote: '치명적 이슈는 없으나, 등록 전 사람이 한 번 더 검수하는 것을 권장합니다.',
  };
}

export class MockAiProvider implements AiProvider {
  async runAgent<TInput, TOutput>(params: RunAgentParams<TInput>): Promise<TOutput> {
    const input = params.input as unknown as ProductInput;

    switch (params.agentType) {
      case 'intake':
        return buildIntake(input) as unknown as TOutput;
      case 'product_analysis':
        return buildProductAnalysis(input) as unknown as TOutput;
      case 'risk':
        return buildRisk(input) as unknown as TOutput;
      case 'market_strategy':
        return buildMarketStrategy(input) as unknown as TOutput;
      case 'seo':
        return buildSeo(input) as unknown as TOutput;
      case 'creative':
        return buildCreative(input) as unknown as TOutput;
      case 'rocketgrowth_ops':
        return buildOpsChecklist() as unknown as TOutput;
      case 'ad_strategy':
        return buildAdStrategy() as unknown as TOutput;
      case 'qa':
        return buildQa() as unknown as TOutput;
      default:
        // TODO: pricing/packager 는 orchestrator 에서 별도 로직(calculator, packager builder)으로 처리한다.
        throw new Error(`MockAiProvider: 지원하지 않는 agentType 입니다: ${params.agentType}`);
    }
  }
}

// TODO(v1.1): 실제 Provider 로 교체 가능한 확장 포인트.
// export class OpenAiProvider implements AiProvider { ... }
// export class AnthropicProvider implements AiProvider { ... }

export function getAiProvider(): AiProvider {
  // AI_PROVIDER 환경변수로 추후 실제 provider 교체 가능하도록 분기점만 남겨둔다.
  return new MockAiProvider();
}
