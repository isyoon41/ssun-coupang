'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { ChecklistItem } from '@/types/domain';

export function ChecklistPanel({
  checklistId,
  title,
  items: initialItems,
  completionRate: initialRate,
}: {
  checklistId: string;
  title: string;
  items: ChecklistItem[];
  completionRate: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [rate, setRate] = useState(initialRate);

  const toggleItem = async (itemId: string, completed: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, completed } : i)));
    const res = await fetch(`/api/checklists/${checklistId}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    const json = await res.json();
    if (json.success) setRate(json.data.completionRate);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <span className="text-sm text-slate-500">{rate.toFixed(0)}% 완료</span>
      </div>
      <Progress value={rate} />
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <label key={item.id} className="flex items-start gap-2 rounded-md border border-slate-100 p-2 text-sm">
            <Checkbox checked={item.completed} onChange={(e) => toggleItem(item.id, e.target.checked)} />
            <span className="flex-1">
              <span className={item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}>{item.label}</span>
              {item.required ? <Badge variant="outline" className="ml-2">필수</Badge> : null}
              {item.description ? <p className="text-xs text-slate-400">{item.description}</p> : null}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
