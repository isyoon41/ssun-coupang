import { cn } from '@/lib/utils';

export function LoadingSpinner({ className, label = '불러오는 중...' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-8 text-sm text-slate-500', className)}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      <span>{label}</span>
    </div>
  );
}
