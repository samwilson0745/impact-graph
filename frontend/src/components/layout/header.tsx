import { Waypoints } from 'lucide-react';
import { DatabaseStatusPill } from '@/components/layout/database-status';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export function Header() {
  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Waypoints className="size-4.5" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold tracking-tight">ImpactGraph</p>
            <p className="text-[11px] text-muted-foreground">Production change impact analyzer</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DatabaseStatusPill />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
