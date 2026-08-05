import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: number;
  accentClassName?: string;
}

export function StatTile({ icon: Icon, label, value, accentClassName }: StatTileProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 overflow-hidden rounded-lg border bg-card p-3">
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md',
          accentClassName,
        )}
      >
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xl font-semibold leading-none tabular-nums">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
