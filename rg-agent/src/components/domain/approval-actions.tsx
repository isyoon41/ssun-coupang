'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ApprovalActions({
  outputId,
  status,
  onChanged,
}: {
  outputId: string;
  status: string;
  onChanged?: () => void;
}) {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);

  const callAction = async (action: 'approve' | 'request-revision' | 'reject') => {
    setLoading(true);
    try {
      await fetch(`/api/outputs/${outputId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      setFeedback('');
      setShowFeedback(false);
      onChanged?.();
    } finally {
      setLoading(false);
    }
  };

  if (status === 'approved') {
    return <p className="text-sm font-medium text-emerald-600">이 산출물은 승인되었습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {showFeedback ? (
        <Textarea
          placeholder="수정 요청 사항을 입력하세요"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={loading} onClick={() => callAction('approve')}>
          승인
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => {
            if (!showFeedback) {
              setShowFeedback(true);
              return;
            }
            callAction('request-revision');
          }}
        >
          수정 요청
        </Button>
        <Button size="sm" variant="destructive" disabled={loading} onClick={() => callAction('reject')}>
          반려
        </Button>
      </div>
    </div>
  );
}
