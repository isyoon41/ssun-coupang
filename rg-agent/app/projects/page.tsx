import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductProjectTable } from '@/components/domain/product-project-table';
import type { ProjectListItem } from '@/types/domain';

export default async function ProjectsPage() {
  const rows = await prisma.productProject.findMany({
    where: { status: { not: 'discarded' } },
    orderBy: { createdAt: 'desc' },
  });

  const projects: ProjectListItem[] = rows.map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    riskLevel: p.riskLevel,
    recommendationGrade: p.recommendationGrade,
    recommendedPrice: p.recommendedPrice,
    expectedMarginRate: p.expectedMarginRate,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">상품 프로젝트</h1>
        <Link href="/projects/new"><Button>새 프로젝트 시작</Button></Link>
      </div>
      <Card>
        <CardHeader><CardTitle>전체 프로젝트 ({projects.length})</CardTitle></CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <EmptyState
              title="아직 프로젝트가 없습니다"
              description="새 프로젝트를 시작해 상품 분석을 진행해보세요."
              action={<Link href="/projects/new"><Button>새 프로젝트 시작</Button></Link>}
            />
          ) : (
            <ProductProjectTable projects={projects} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
