import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RiskLevelBadge } from '@/components/domain/risk-level-badge';
import type { RiskItem, RiskOutput } from '@/types/domain';

function RiskGroup({ title, items }: { title: string; items: RiskItem[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-800">{title}</p>
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <Alert key={idx} variant={item.level === 'low' ? 'default' : item.level === 'medium' ? 'warning' : 'danger'}>
            <AlertTitle className="flex items-center gap-2">
              <RiskLevelBadge level={item.level} />
              {item.title}
            </AlertTitle>
            <AlertDescription>{item.description}</AlertDescription>
            <AlertDescription className="mt-1 font-medium">필요 조치: {item.actionRequired}</AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
}

export function RiskPanel({ risk }: { risk: RiskOutput }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-800">종합 리스크 수준</span>
        <RiskLevelBadge level={risk.overallRiskLevel} />
      </div>

      <RiskGroup title="IP/상표 리스크 (1차 점검)" items={risk.ipRisks} />
      <RiskGroup title="표시·광고 리스크 (1차 점검)" items={risk.adExpressionRisks} />
      <RiskGroup title="인증 리스크 (1차 점검)" items={risk.certificationRisks} />
      <RiskGroup title="이미지 저작권 리스크 (1차 점검)" items={risk.imageCopyrightRisks} />

      {risk.prohibitedExpressions?.length ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">사용 금지 표현</p>
          <div className="flex flex-wrap gap-1">
            {risk.prohibitedExpressions.map((expr) => (
              <Badge key={expr} variant="danger">{expr}</Badge>
            ))}
          </div>
        </div>
      ) : null}

      {risk.replacementExpressions?.length ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">대체 표현 제안</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            {risk.replacementExpressions.map((r, idx) => (
              <li key={idx}>
                <span className="text-red-600">{r.original}</span> → <span className="text-emerald-700">{r.replacement}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {risk.kiprisSearchKeywords?.length ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">키프리스(KIPRIS) 직접 확인 권장 키워드</p>
          <div className="flex flex-wrap gap-1">
            {risk.kiprisSearchKeywords.map((kw) => (
              <Badge key={kw} variant="outline">{kw}</Badge>
            ))}
          </div>
        </div>
      ) : null}

      <Alert variant="warning">
        <AlertDescription>{risk.finalWarning}</AlertDescription>
      </Alert>
    </div>
  );
}
