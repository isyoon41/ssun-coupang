'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/ui/copy-button';
import type { SeoOutput } from '@/types/domain';

export function SeoTagsEditor({ seo }: { seo: SeoOutput }) {
  const [tags, setTags] = useState(seo.searchTags20);
  const [newTag, setNewTag] = useState('');

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));
  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 20) return;
    setTags((prev) => [...prev, trimmed]);
    setNewTag('');
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1 text-sm font-semibold text-slate-800">추천 상품명</p>
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm">{seo.recommendedTitle}</p>
        <p className="mt-1 text-xs text-slate-500">{seo.titleRationale}</p>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">검색어 태그 ({tags.length}/20)</p>
          <CopyButton text={tags.join(', ')} label="태그 전체 복사" />
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="info" className="cursor-pointer" onClick={() => removeTag(tag)}>
              {tag} ✕
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="태그 추가"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            추가
          </Button>
        </div>
      </div>

      {seo.cautions?.length ? (
        <div className="text-xs text-amber-700">
          {seo.cautions.map((c, idx) => (
            <p key={idx}>· {c}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
