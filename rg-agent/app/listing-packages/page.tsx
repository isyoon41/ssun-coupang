import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';

export default async function ListingPackagesPage() {
  const packages = await prisma.listingPackage.findMany({
    include: { project: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">등록 패키지</h1>
        <p className="text-sm text-slate-500">
          쿠팡 WING에 직접 복붙·업로드할 수 있는 등록 패키지 목록입니다. 자동 등록/제출은 지원하지 않습니다.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>생성된 패키지 ({packages.length})</CardTitle></CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <EmptyState title="아직 생성된 등록 패키지가 없습니다" />
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {packages.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{pkg.title}</p>
                    <Badge variant="outline" className="mt-1">v{pkg.version}</Badge>
                  </div>
                  <Link
                    href={`/projects/${pkg.projectId}?tab=package`}
                    className="text-sm font-medium text-brand-600 hover:underline"
                  >
                    패키지 보기 →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
