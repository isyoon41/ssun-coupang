export function buildMarkdownPackage(params: {
  projectTitle: string;
  warnings: string[];
  listingFields: {
    productTitle: string;
    categoryCandidate?: string;
    searchTags20: string[];
    salePrice?: number;
    shortDescription?: string;
  };
  detailPageMarkdown?: string;
  adCopies?: string[];
  imagePrompts?: string[];
  inboundChecklist?: string[];
  riskChecklist?: string[];
}) {
  const lines: string[] = [];
  lines.push(`# 쿠팡 등록 패키지: ${params.projectTitle}`);
  lines.push('');

  if (params.warnings.length) {
    lines.push('## 등록 전 경고');
    params.warnings.forEach((w) => lines.push(`- ${w}`));
    lines.push('');
  }

  lines.push('## 1. 상품 기본 정보');
  lines.push(`- 상품명: ${params.listingFields.productTitle}`);
  lines.push(`- 카테고리 후보: ${params.listingFields.categoryCandidate ?? '확인 필요'}`);
  lines.push(`- 판매가: ${params.listingFields.salePrice ?? '확인 필요'}`);
  lines.push(`- 요약: ${params.listingFields.shortDescription ?? ''}`);
  lines.push('');

  lines.push('## 2. 검색어 태그 20개');
  params.listingFields.searchTags20.forEach((tag, index) => lines.push(`${index + 1}. ${tag}`));
  lines.push('');

  if (params.detailPageMarkdown) {
    lines.push('## 3. 상세페이지 문구');
    lines.push(params.detailPageMarkdown);
    lines.push('');
  }

  if (params.adCopies?.length) {
    lines.push('## 4. 광고 카피');
    params.adCopies.forEach((copy) => lines.push(`- ${copy}`));
    lines.push('');
  }

  if (params.imagePrompts?.length) {
    lines.push('## 5. 이미지 생성 프롬프트');
    params.imagePrompts.forEach((prompt, index) => lines.push(`${index + 1}. ${prompt}`));
    lines.push('');
  }

  if (params.riskChecklist?.length) {
    lines.push('## 6. 리스크 체크리스트');
    params.riskChecklist.forEach((item) => lines.push(`- [ ] ${item}`));
    lines.push('');
  }

  if (params.inboundChecklist?.length) {
    lines.push('## 7. 로켓그로스 입고 체크리스트');
    params.inboundChecklist.forEach((item) => lines.push(`- [ ] ${item}`));
    lines.push('');
  }

  return lines.join('\n');
}
