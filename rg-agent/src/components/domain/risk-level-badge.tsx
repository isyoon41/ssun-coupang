import { Badge } from '@/components/ui/badge';
import type { RiskLevel } from '@/types/domain';

const RISK_LABEL: Record<RiskLevel, string> = {
  low: '낮음',
  medium: '중간',
  high: '높음',
  critical: '심각',
};

const RISK_VARIANT: Record<RiskLevel, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

export function RiskLevelBadge({ level }: { level: RiskLevel | string | null | undefined }) {
  if (!level) return <Badge variant="outline">미점검</Badge>;
  const key = level as RiskLevel;
  return <Badge variant={RISK_VARIANT[key] ?? 'default'}>리스크 {RISK_LABEL[key] ?? level}</Badge>;
}
