'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: '대시보드' },
  { href: '/projects', label: '상품 프로젝트' },
  { href: '/projects/new', label: '새 프로젝트' },
  { href: '/approvals', label: '검수·승인' },
  { href: '/listing-packages', label: '등록 패키지' },
  { href: '/settings', label: '설정' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
      <div className="mb-8 px-2">
        <p className="text-lg font-bold text-brand-700">RG Agent</p>
        <p className="text-xs text-slate-400">로켓그로스 등록 보조 AI</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
