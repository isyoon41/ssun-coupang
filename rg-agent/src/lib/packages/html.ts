export function buildHtmlPackage(params: {
  projectTitle: string;
  warnings: string[];
  listingFields: {
    productTitle: string;
    categoryCandidate?: string;
    searchTags20: string[];
    salePrice?: number;
    shortDescription?: string;
  };
  detailPageHtml?: string;
  adCopies?: string[];
}) {
  const warningsHtml = params.warnings.length
    ? `<section><h2>등록 전 경고</h2><ul>${params.warnings.map((w) => `<li>${w}</li>`).join('')}</ul></section>`
    : '';

  const tagsHtml = `<ol>${params.listingFields.searchTags20.map((t) => `<li>${t}</li>`).join('')}</ol>`;
  const adCopiesHtml = params.adCopies?.length
    ? `<section><h2>광고 카피</h2><ul>${params.adCopies.map((c) => `<li>${c}</li>`).join('')}</ul></section>`
    : '';

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8" /><title>쿠팡 등록 패키지: ${params.projectTitle}</title></head>
<body>
  <h1>쿠팡 등록 패키지: ${params.projectTitle}</h1>
  ${warningsHtml}
  <section>
    <h2>상품 기본 정보</h2>
    <p>상품명: ${params.listingFields.productTitle}</p>
    <p>카테고리 후보: ${params.listingFields.categoryCandidate ?? '확인 필요'}</p>
    <p>판매가: ${params.listingFields.salePrice ?? '확인 필요'}</p>
    <p>요약: ${params.listingFields.shortDescription ?? ''}</p>
  </section>
  <section>
    <h2>검색어 태그 20개</h2>
    ${tagsHtml}
  </section>
  ${params.detailPageHtml ? `<section><h2>상세페이지</h2>${params.detailPageHtml}</section>` : ''}
  ${adCopiesHtml}
</body>
</html>`;
}
