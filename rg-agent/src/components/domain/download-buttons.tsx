'use client';

import { Button } from '@/components/ui/button';

const FORMATS: { format: string; label: string }[] = [
  { format: 'markdown', label: '마크다운(.md)' },
  { format: 'html', label: 'HTML' },
  { format: 'csv', label: 'CSV' },
  { format: 'json', label: 'JSON' },
];

export function DownloadButtons({ listingPackageId }: { listingPackageId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FORMATS.map(({ format, label }) => (
        <Button
          key={format}
          variant="outline"
          size="sm"
          onClick={() => window.open(`/api/listing-packages/${listingPackageId}/download?format=${format}`, '_blank')}
        >
          {label} 다운로드
        </Button>
      ))}
    </div>
  );
}
