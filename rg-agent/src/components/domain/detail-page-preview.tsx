'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CopyButton } from '@/components/ui/copy-button';
import type { CreativeOutput } from '@/types/domain';

export function DetailPagePreview({ creative }: { creative: CreativeOutput }) {
  const [tab, setTab] = useState('preview');

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="preview">미리보기</TabsTrigger>
          <TabsTrigger value="markdown">마크다운</TabsTrigger>
          <TabsTrigger value="thumbnails">썸네일 콘셉트</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">
          <div className="flex flex-col gap-4 rounded-md border border-slate-200 p-4">
            {creative.detailPageSections.map((section) => (
              <div key={section.order}>
                <p className="text-sm font-semibold text-slate-800">{section.order}. {section.title}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{section.body}</p>
                <p className="mt-1 text-xs text-slate-400">이미지 가이드: {section.imageGuide}</p>
                {section.riskNote ? <p className="mt-1 text-xs text-amber-600">{section.riskNote}</p> : null}
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="markdown">
          <div className="flex justify-end pb-2">
            <CopyButton text={creative.detailPageMarkdown} label="마크다운 복사" />
          </div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-900 p-4 text-xs text-slate-100">
            {creative.detailPageMarkdown}
          </pre>
        </TabsContent>
        <TabsContent value="thumbnails">
          <div className="grid gap-3 md:grid-cols-2">
            {creative.thumbnailConcepts.map((concept, idx) => (
              <div key={idx} className="rounded-md border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-800">{concept.title}</p>
                <p className="mt-1 text-sm text-slate-600">{concept.concept}</p>
                <p className="mt-1 text-xs text-slate-400">{concept.visualDirection}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
