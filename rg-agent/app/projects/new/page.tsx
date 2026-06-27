'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SOURCE_PLATFORMS = [
  { value: 'manual', label: '직접 입력' },
  { value: 'domeme', label: '도매매' },
  { value: 'coupang', label: '쿠팡(셀러분석용)' },
  { value: 'smartstore', label: '스마트스토어' },
  { value: 'taobao', label: '타오바오' },
  { value: 'alpha1688', label: '1688' },
  { value: 'other', label: '기타' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState('manual');
  const [rawDescription, setRawDescription] = useState('');
  const [categoryHint, setCategoryHint] = useState('');
  const [supplyPrice, setSupplyPrice] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('상품명(가칭)은 필수입니다.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          sourceUrl: sourceUrl || undefined,
          sourcePlatform,
          rawProductName: title,
          rawDescription: rawDescription || undefined,
          categoryHint: categoryHint || undefined,
          supplyPrice: supplyPrice ? Number(supplyPrice) : undefined,
          memo: memo || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? '프로젝트 생성에 실패했습니다.');
        return;
      }
      router.push(`/projects/${json.data.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>새 프로젝트 시작</CardTitle>
          <p className="text-sm text-slate-500">
            상품 링크, 이미지 설명, 또는 직접 작성한 텍스트로 새 프로젝트를 시작하세요.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error ? (
            <Alert variant="danger"><AlertDescription>{error}</AlertDescription></Alert>
          ) : null}

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            상품명(가칭) *
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 휴대용 보조배터리 20000mAh" />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            소싱 플랫폼
            <Select value={sourcePlatform} onChange={(e) => setSourcePlatform(e.target.value)}>
              {SOURCE_PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            상품 링크 (선택)
            <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            카테고리 힌트 (선택)
            <Input value={categoryHint} onChange={(e) => setCategoryHint(e.target.value)} placeholder="예: 생활/건강 > 전자기기" />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            공급가 (선택, 원)
            <Input type="number" value={supplyPrice} onChange={(e) => setSupplyPrice(e.target.value)} />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            상품 설명 / 이미지 설명 / 메모
            <Textarea
              value={rawDescription}
              onChange={(e) => setRawDescription(e.target.value)}
              placeholder="상품 특징, 소재, 사용법 등을 자유롭게 입력하세요. 이미지를 텍스트로 설명해도 됩니다."
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            추가 메모 (선택)
            <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
          </label>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '생성 중...' : '프로젝트 생성'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
