import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail } from '@/types/api';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const listingPackage = await prisma.listingPackage.findUnique({ where: { id: params.id } });
  if (!listingPackage) {
    return NextResponse.json(fail('NOT_FOUND', '등록 패키지를 찾을 수 없습니다.'), { status: 404 });
  }

  const format = req.nextUrl.searchParams.get('format') ?? 'markdown';
  const filenameBase = listingPackage.title.replace(/[^\w가-힣-]+/g, '_');

  switch (format) {
    case 'markdown':
      return new NextResponse(listingPackage.markdownContent, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.md"`,
        },
      });
    case 'html':
      return new NextResponse(listingPackage.htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.html"`,
        },
      });
    case 'csv':
      return new NextResponse(listingPackage.csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
        },
      });
    case 'json':
      return new NextResponse(listingPackage.packageJson, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.json"`,
        },
      });
    default:
      return NextResponse.json(
        fail('INVALID_FORMAT', 'format 파라미터는 markdown, html, csv, json 중 하나여야 합니다.'),
        { status: 400 },
      );
  }
}
