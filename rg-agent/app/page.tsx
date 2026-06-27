import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductProjectTable } from '@/components/domain/product-project-table';
import { EmptyState } from '@/components/ui/empty-state';
import type { ProjectListItem } from '@/types/domain';

export default async function DashboardPage() {
  const [totalProjects, awaitingReview, listingReady, recentProjects] = await Promise.all([
    prisma.productProject.count({ where: { status: { not: 'discarded' } } }),
    prisma.aiOutput.count({ where: { status: 'draft' } }),
    prisma.productProject.count({ where: { status: 'listing_pack_ready' } }),
    prisma.productProject.findMany({
      where: { status: { not: 'discarded' } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ]);

  const projects: ProjectListItem[] = recentProjects.map((p) => ({
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
        <div>
          <h1 className="text-xl font-bold text-slate-900">대시보드</h1>
          <p className="text-sm text-slate-500">로켓그로스 등록 보조 워크플로 현황입니다.</p>
        </div>
        <Link href="/projects/new">
          <Button>새 프로젝트 시작</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>전체 프로젝트</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalProjects}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>검수 대기 산출물</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{awaitingReview}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>등록 패키지 준비 완료</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{listingReady}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>최근 프로젝트</CardTitle></CardHeader>
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
