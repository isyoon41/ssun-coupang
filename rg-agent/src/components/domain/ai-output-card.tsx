import { ReactNode } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApprovalActions } from '@/components/domain/approval-actions';

const STATUS_LABEL: Record<string, string> = {
  draft: '검수 대기',
  approved: '승인됨',
  revision_requested: '수정 요청됨',
  rejected: '반려됨',
  locked: '잠김',
};

export function AiOutputCard({
  outputId,
  title,
  status,
  version,
  children,
  onChanged,
}: {
  outputId: string;
  title: string;
  status: string;
  version?: number;
  children: ReactNode;
  onChanged?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            {version ? <Badge variant="outline">v{version}</Badge> : null}
            <Badge variant={status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'}>
              {STATUS_LABEL[status] ?? status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-700">{children}</CardContent>
      <CardFooter>
        <ApprovalActions outputId={outputId} status={status} onChanged={onChanged} />
      </CardFooter>
    </Card>
  );
}
