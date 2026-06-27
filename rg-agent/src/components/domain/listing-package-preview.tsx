'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { DownloadButtons } from '@/components/domain/download-buttons';
import { formatKrw } from '@/lib/utils';
import type { PackagerOutput } from '@/types/domain';

export function ListingPackagePreview({
  listingPackageId,
  packageData,
}: {
  listingPackageId: string;
  packageData: PackagerOutput;
}) {
  const [tab, setTab] = useState('fields');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-semibold text-slate-900">{packageData.packageTitle}</p>
        <DownloadButtons listingPackageId={listingPackageId} />
      </div>

      {packageData.warnings?.length ? (
        <Alert variant="warning">
          {packageData.warnings.map((w, idx) => (
            <AlertDescription key={idx}>· {w}</AlertDescription>
          ))}
        </Alert>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="fields">등록 필드</TabsTrigger>
          <TabsTrigger value="detail">상세페이지</TabsTrigger>
          <TabsTrigger value="ad">광고/크리에이티브</TabsTrigger>
          <TabsTrigger value="checklist">체크리스트</TabsTrigger>
        </TabsList>

        <TabsContent value="fields">
          <div className="flex flex-col gap-3 rounded-md border border-slate-200 p-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-800">상품명</p>
              <CopyButton text={packageData.listingFields.productTitle} />
            </div>
            <p className="rounded bg-slate-50 px-3 py-2">{packageData.listingFields.productTitle}</p>
            <p>카테고리(후보): {packageData.listingFields.categoryCandidate}</p>
            <p>판매가: {formatKrw(packageData.listingFields.salePrice)}</p>
            <div>
              <p className="mb-1 font-medium text-slate-800">검색어 태그 (20개)</p>
              <div className="flex flex-wrap gap-1">
                {packageData.listingFields.searchTags20.map((tag) => (
                  <Badge key={tag} variant="info">{tag}</Badge>
                ))}
              </div>
            </div>
            <p>{packageData.listingFields.shortDescription}</p>
          </div>
        </TabsContent>

        <TabsContent value="detail">
          <div className="flex justify-end pb-2">
            <CopyButton text={packageData.detailPage.markdown} label="마크다운 복사" />
          </div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-900 p-4 text-xs text-slate-100">
            {packageData.detailPage.markdown}
          </pre>
        </TabsContent>

        <TabsContent value="ad">
          <div className="flex flex-col gap-3 text-sm">
            <p className="font-medium text-slate-800">광고 카피</p>
            <ul className="list-disc space-y-1 pl-5">
              {packageData.ad.adCopies.map((copy, idx) => (
                <li key={idx}>{copy}</li>
              ))}
            </ul>
            <p className="font-medium text-slate-800">광고 운영 전략</p>
            <p className="text-slate-600">{packageData.ad.adStrategy}</p>
            <p className="font-medium text-slate-800">썸네일 콘셉트</p>
            <ul className="list-disc space-y-1 pl-5">
              {packageData.creative.thumbnailConcepts.map((concept, idx) => (
                <li key={idx}>{concept}</li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium text-slate-800">로켓그로스 입고 체크리스트</p>
            <ul className="list-disc space-y-1 pl-5">
              {packageData.inboundChecklist.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p className="font-medium text-slate-800">리스크 1차 점검 체크리스트</p>
            <ul className="list-disc space-y-1 pl-5">
              {packageData.riskChecklist.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
