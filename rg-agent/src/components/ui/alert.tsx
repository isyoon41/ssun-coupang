import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AlertVariant = 'default' | 'warning' | 'danger' | 'success';

const variantClasses: Record<AlertVariant, string> = {
  default: 'bg-slate-50 border-slate-200 text-slate-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  danger: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('rounded-md border px-4 py-3 text-sm', variantClasses[variant], className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mb-1 font-semibold', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('leading-relaxed', className)} {...props} />;
}
