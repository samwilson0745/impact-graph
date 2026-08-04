'use client';

import { CircleAlert, CircleCheck, CircleDashed } from 'lucide-react';
import { useHealth } from '@/hooks/useHealth';
import { cn } from '@/lib/utils';

export function DatabaseStatusPill() {
  const { data, isPending, isError } = useHealth();

  const unreachable = isError || data?.status === 'database_unreachable';

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        isPending && 'border-border text-muted-foreground',
        !isPending && unreachable && 'border-destructive/30 bg-destructive/10 text-destructive',
        !isPending && !unreachable && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      )}
    >
      {isPending ? (
        <CircleDashed className="size-3.5 animate-spin" />
      ) : unreachable ? (
        <CircleAlert className="size-3.5" />
      ) : (
        <CircleCheck className="size-3.5" />
      )}
      {isPending ? 'Checking CognoDB…' : unreachable ? 'CognoDB unreachable' : 'CognoDB connected'}
    </div>
  );
}
