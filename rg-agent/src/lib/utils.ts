import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatKrw(value: number | null | undefined) {
  if (value === null || value === undefined) return '확인 필요';
  return `${value.toLocaleString('ko-KR')}원`;
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return '확인 필요';
  return `${value.toFixed(1)}%`;
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
