function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsvPackage(params: {
  listingFields: {
    productTitle: string;
    categoryCandidate?: string;
    searchTags20: string[];
    salePrice?: number;
    shortDescription?: string;
  };
}) {
  const header = ['상품명', '카테고리 후보', '판매가', '요약', '검색어 태그'];
  const row = [
    params.listingFields.productTitle,
    params.listingFields.categoryCandidate ?? '',
    String(params.listingFields.salePrice ?? ''),
    params.listingFields.shortDescription ?? '',
    params.listingFields.searchTags20.join('|'),
  ];

  return [header.map(escapeCsv).join(','), row.map(escapeCsv).join(',')].join('\n');
}
