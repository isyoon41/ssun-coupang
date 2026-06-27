import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectStatusBadge } from '@/components/domain/project-status-badge';
import { RiskLevelBadge } from '@/components/domain/risk-level-badge';
import { RecommendationGradeBadge } from '@/components/domain/recommendation-grade-badge';
import { formatKrw } from '@/lib/utils';
import type { ProjectListItem } from '@/types/domain';

export function ProductProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2">{project.title}</CardTitle>
          <ProjectStatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-slate-600">
        <div className="flex flex-wrap gap-2">
          <RiskLevelBadge level={project.riskLevel} />
          <RecommendationGradeBadge grade={project.recommendationGrade} />
        </div>
        <p>예상 판매가: {formatKrw(project.recommendedPrice)}</p>
        <p>예상 마진율: {project.expectedMarginRate ? `${project.expectedMarginRate.toFixed(1)}%` : '확인 필요'}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/projects/${project.id}`} className="text-sm font-medium text-brand-600 hover:underline">
          상세 보기 →
        </Link>
      </CardFooter>
    </Card>
  );
}
