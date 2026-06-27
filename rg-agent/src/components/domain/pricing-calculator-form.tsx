'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PricingInput } from '@/types/domain';

const FIELD_LABELS: { key: keyof PricingInput; label: string }[] = [
  { key: 'supplyPrice', label: '공급가' },
  { key: 'domesticShippingCost', label: '국내 배송비' },
  { key: 'overseasShippingCost', label: '해외 배송비' },
  { key: 'customsCost', label: '관세/통관비' },
  { key: 'packagingCost', label: '포장비' },
  { key: 'otherCost', label: '기타 비용' },
  { key: 'coupangFeeRate', label: '쿠팡 수수료율(%)' },
  { key: 'fulfillmentFee', label: '로켓그로스 풀필먼트비' },
  { key: 'storageFeeEstimate', label: '보관비(예상)' },
  { key: 'returnFeeEstimate', label: '반품비(예상)' },
  { key: 'adCostEstimate', label: '광고비(예상)' },
  { key: 'targetMarginRate', label: '목표 마진율(%)' },
];

export function PricingCalculatorForm({
  projectId,
  defaultInput,
  onResult,
}: {
  projectId: string;
  defaultInput: PricingInput;
  onResult: (result: unknown) => void;
}) {
  const [input, setInput] = useState<PricingInput>(defaultInput);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof PricingInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (json.success) onResult(json.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELD_LABELS.map(({ key, label }) => (
          <label key={key} className="flex flex-col gap-1 text-sm text-slate-600">
            {label}
            <Input
              type="number"
              value={input[key]}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </label>
        ))}
      </div>
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? '계산 중...' : '가격 계산하기'}
      </Button>
    </div>
  );
}
