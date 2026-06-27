import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatKrw, formatPercent } from '@/lib/utils';
import type { PricingCalcOutput } from '@/types/domain';

export function PricingResultCard({ result }: { result: PricingCalcOutput }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>가격·마진 계산 결과</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-400">추천 판매가</p>
          <p className="text-lg font-semibold text-slate-900">{formatKrw(result.recommendedPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">최저 판매가</p>
          <p className="text-lg font-semibold text-slate-900">{formatKrw(result.minimumPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">광고 안전가</p>
          <p className="text-lg font-semibold text-slate-900">{formatKrw(result.adSafePrice)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">예상 순이익</p>
          <p className="text-lg font-semibold text-slate-900">{formatKrw(result.expectedProfit)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">예상 마진율</p>
          <p className="text-lg font-semibold text-slate-900">{formatPercent(result.expectedMarginRate)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">손익분기 수량</p>
          <p className="text-lg font-semibold text-slate-900">{result.breakevenQuantity.toLocaleString('ko-KR')}개</p>
        </div>
        {result.warnings?.length ? (
          <div className="sm:col-span-2">
            <Alert variant="warning">
              {result.warnings.map((w, idx) => (
                <AlertDescription key={idx}>· {w}</AlertDescription>
              ))}
            </Alert>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
