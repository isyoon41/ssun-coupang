import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProjectWorkspace } from '@/components/domain/project-workspace';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.productProject.findUnique({
    where: { id: params.id },
    include: {
      aiOutputs: { orderBy: { createdAt: 'desc' } },
      pricingOutputs: { orderBy: { createdAt: 'desc' } },
      checklists: { orderBy: { createdAt: 'desc' } },
      listingPackages: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!project) notFound();

  const serialized = {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    aiOutputs: project.aiOutputs.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
    pricingOutputs: project.pricingOutputs.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    checklists: project.checklists.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    listingPackages: project.listingPackages.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
  };

  return <ProjectWorkspace project={serialized} />;
}
