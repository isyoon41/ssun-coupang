import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProjectStatusBadge } from '@/components/domain/project-status-badge';
import { RiskLevelBadge } from '@/components/domain/risk-level-badge';
import { RecommendationGradeBadge } from '@/components/domain/recommendation-grade-badge';
import { formatKrw } from '@/lib/utils';
import type { ProjectListItem } from '@/types/domain';

export function ProductProjectTable({ projects }: { projects: ProjectListItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>상품명</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>리스크</TableHead>
          <TableHead>추천등급</TableHead>
          <TableHead>예상 판매가</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium text-slate-900">{project.title}</TableCell>
            <TableCell><ProjectStatusBadge status={project.status} /></TableCell>
            <TableCell><RiskLevelBadge level={project.riskLevel} /></TableCell>
            <TableCell><RecommendationGradeBadge grade={project.recommendationGrade} /></TableCell>
            <TableCell>{formatKrw(project.recommendedPrice)}</TableCell>
            <TableCell>
              <Link href={`/projects/${project.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                상세 보기
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
