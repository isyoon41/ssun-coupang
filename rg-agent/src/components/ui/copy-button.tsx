'use client';

import { useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';

export function CopyButton({ text, label = '복사', ...props }: { text: string; label?: string } & Omit<ButtonProps, 'onClick'>) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick} {...props}>
      {copied ? '복사됨!' : label}
    </Button>
  );
}
