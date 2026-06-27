import { Badge } from '@/components/ui/badge';
import type { RecommendationGrade } from '@/types/domain';

const GRADE_VARIANT: Record<RecommendationGrade, 'success' | 'info' | 'warning' | 'danger'> = {
  A: 'success',
  B: 'success',
  C: 'info',
  D: 'warning',
  E: 'danger',
};

export function RecommendationGradeBadge({ grade }: { grade: RecommendationGrade | string | null | undefined }) {
  if (!grade) return <Badge variant="outline">미평가</Badge>;
  const key = grade as RecommendationGrade;
  return <Badge variant={GRADE_VARIANT[key] ?? 'default'}>추천등급 {grade}</Badge>;
}
